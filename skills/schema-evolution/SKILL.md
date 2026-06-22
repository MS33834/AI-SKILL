---
slug: schema-evolution
name: Schema Evolution
version: 0.2.0
description: Plan a backward-compatible schema change for events or APIs.
category: dev-tools
tags: ['schema', 'evolution', 'backward-compatibility', 'data']
inputs:
  - name: schema_context
    type: string
    required: true
    description: Events, API, database, etc.
  - name: change
    type: string
    required: true
    description: Proposed schema change
output:
  format: markdown
  description: Evolution plan with additive-only steps and consumer coordination.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-22
---

# When to use

Changing event schemas, API contracts, or database columns used by multiple consumers.

# Inputs

Describe the schema context and proposed change.

# Output

A backward-compatible evolution plan with steps and consumer coordination.

# Prompt

```prompt
Plan a backward-compatible schema evolution.

Output:
1. Current schema and proposed change
2. Compatibility analysis: additive vs breaking
3. Phased rollout: deploy producers first, then consumers
4. Default values and sentinels for optional fields
5. Deprecation: when to remove old fields
6. Consumer communication: schema registry, docs, code review

Avoid breaking changes unless all consumers are known and updated in one deploy.

```

# When NOT to use

- Internal data structures with a single consumer deployed together
- Prototypes where schema stability is not expected
- Cases requiring a breaking change with coordinated consumer migration — use a migration plan instead

## 向后兼容 vs 前向兼容

### 核心概念

| 兼容性类型 | 定义 | 常见场景 |
|-----------|------|---------|
| **向后兼容 (Backward Compatible)** | 新代码能读取旧数据 | 消费者升级后能处理旧事件 |
| **前向兼容 (Forward Compatible)** | 旧代码能读取新数据 | 生产者升级后，旧消费者仍能工作 |

```
向后兼容：Consumer v2 能处理 Producer v1 发出的数据
前向兼容：Producer v2 发出的数据，Consumer v1 仍能处理
```

### 黄金法则

```
生产者：只能做兼容扩展（ADD ONLY）
消费者：必须优雅处理未知字段（IGNORE UNKNOWN）
```

### 实际例子：JSON Schema 演进

```json
// v1 初始版本
{
  "user_id": "123",
  "email": "user@example.com"
}

// v2 添加新字段（向后兼容）
{
  "user_id": "123",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z"  // 新增，可选
}

// v3 字段重命名（Breaking - 需要两步迁移）
// 步骤1：同时保留新旧字段
{
  "user_id": "123",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "user_identifier": "123"  // 新字段，逐步迁移
}
// 步骤2（等所有消费者更新后）：删除旧字段
{
  "user_id": null,  // 或删除此字段
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "user_identifier": "123"
}
```

## 真实 Schema 演变 SQL 示例

### ADD COLUMN（添加列）- Safe

```sql
-- PostgreSQL: 添加可空列或有默认值的列是即时的，不锁表
ALTER TABLE users
  ADD COLUMN last_login_at TIMESTAMP DEFAULT '1970-01-01';

-- MySQL 8.0+: 添加有默认值的列使用 ALGORITHM=INPLACE
ALTER TABLE users
  ADD COLUMN preferences JSON DEFAULT NULL,
  ALGORITHM=INPLACE, LOCK=NONE;

-- ⚠️ 添加 NOT NULL  WITHOUT 默认值会 rewrite table
ALTER TABLE users
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';  -- 安全
```

### RENAME COLUMN（重命名列）- Safe with care

```sql
-- PostgreSQL: 重命名列是元数据操作，非常快
ALTER TABLE orders
  RENAME COLUMN total_price TO total_amount;

-- MySQL: 间接方式（添加→迁移→删除）
ALTER TABLE orders ADD COLUMN total_amount DECIMAL(15,2);
UPDATE orders SET total_amount = total_price;
ALTER TABLE orders DROP COLUMN total_price;  -- 等所有消费者更新后
```

### Drop Column（删除列）- Safe 方法

```sql
-- 危险操作：直接删除会立即影响依赖该列的查询
-- 安全方法：分三步

-- Step 1: 停止写入该列（代码层面）
-- 确保所有写操作不再使用该字段

-- Step 2: 标记为 deprecated（至少一个版本周期）
ALTER TABLE orders
  ALTER COLUMN total_price SET DEFAULT NULL;
COMMENT ON COLUMN orders.total_price IS 'DEPRECATED: use total_amount instead. Will be removed in v3.0';

-- Step 3: 确认无消费者后删除
ALTER TABLE orders DROP COLUMN total_price;
```

### 改变列类型 - Safe 方法

```sql
-- ⚠️ 直接 ALTER COLUMN TYPE 会锁表
-- PostgreSQL safe 方法：

-- Step 1: 添加新列
ALTER TABLE orders ADD COLUMN total_amount DECIMAL(15,2);

-- Step 2: 创建触发器同步数据
CREATE OR REPLACE FUNCTION sync_total_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_price IS NOT NULL THEN
    NEW.total_amount = NEW.total_price::DECIMAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_total_amount_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION sync_total_amount();

-- Step 3: 回填历史数据
UPDATE orders SET total_amount = total_price::DECIMAL WHERE total_amount IS NULL;

-- Step 4: 切换代码使用新列
-- Step 5: 删除旧列和触发器
DROP TRIGGER sync_total_amount_trigger ON orders;
ALTER TABLE orders DROP COLUMN total_price;
```

## Schema 版本管理工具配置

### Flyway 配置示例

```
directory: db/migration
extensions: postgresql
```

```sql
-- V1__Create_initial_schema.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V2__Add_preferences_column.sql
ALTER TABLE users ADD COLUMN preferences JSON DEFAULT '{}';

-- V3__Add_user_identifier.sql
ALTER TABLE users ADD COLUMN user_identifier VARCHAR(255);
UPDATE users SET user_identifier = id::TEXT;
ALTER TABLE users ALTER COLUMN user_identifier SET NOT NULL;

-- V4__Mark_email_nullable.sql  (注意：这是向后兼容的)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- V5__Remove_created_at.sql  (在确认无消费者后)
ALTER TABLE users DROP COLUMN created_at;
```

```properties
# application.properties (Flyway)
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
spring.flyway.out-of-order=true  # 允许乱序执行（仅开发环境）
```

### Liquibase 配置示例

```xml
<!-- changelog.xml -->
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd">

    <!-- ChangeSet 1: Initial schema -->
    <changeSet id="1" author="developer">
        <createTable tableName="users">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="email" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>

    <!-- ChangeSet 2: Add column (backward compatible) -->
    <changeSet id="2" author="developer">
        <addColumn tableName="users">
            <column name="preferences" type="JSON" defaultValue="{}"/>
        </addColumn>
    </changeSet>

    <!-- ChangeSet 3: Rename column (two-step) -->
    <changeSet id="3" author="developer" runAlways="true">
        <sql>
            ALTER TABLE users ADD COLUMN user_identifier VARCHAR(255);
            UPDATE users SET user_identifier = id::TEXT WHERE user_identifier IS NULL;
        </sql>
        <rollback>
            ALTER TABLE users DROP COLUMN user_identifier;
        </rollback>
    </changeSet>

    <!-- ChangeSet 4: Drop column (with confirmation check) -->
    <changeSet id="4" author="developer">
        <preConditions onFail="MARK_RAN">
            <sqlCheck expectedResult="0">
                SELECT COUNT(*) FROM users WHERE created_at IS NOT NULL
            </sqlCheck>
        </preConditions>
        <dropColumn tableName="users" columnName="created_at"/>
    </changeSet>

</databaseChangeLog>
```

### Schema Registry（Kafka）配置

```yaml
# schema_registry.yml
version: 1

compatibility: BACKWARD_TRANSITIVE
# BACKWARD: 新 schema 可解析旧数据
# FORWARD: 旧 schema 可解析新数据
# FULL: 双向兼容
# TRANSITIVE: 递归检查所有版本

auto_registration: false  # 生产者必须显式注册

rules:
  - type: FIELD_CONSTRAINTS
    value:
      email:
        minLength: 1
        maxLength: 255
      age:
        min: 0
        max: 150
```

```python
# Kafka Schema Registry 客户端使用示例
from confluent_kafka import Producer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

# 配置 Avro schema（向后兼容）
schema_str = """
{
  "type": "record",
  "name": "UserEvent",
  "fields": [
    {"name": "user_id", "type": "long"},
    {"name": "email", "type": "string"},
    {"name": "preferences", "type": {"type": "map", "values": "string"}, "default": {}}
  ]
}
"""

# 新增字段使用 default，确保持续向后兼容
```

## 向后兼容检查清单

```markdown
## Schema 变更检查清单

### 添加操作
- [ ] 新字段有默认值或标记为可选
- [ ] 新字段在消费者之前部署到生产者
- [ ] 旧消费者能忽略新字段而不崩溃

### 修改操作
- [ ] 字段类型修改是扩大而非缩小（如 INT → BIGINT）
- [ ] 字段重命名分两步：添加新字段 → 迁移数据 → 删除旧字段
- [ ] 默认值改变不破坏现有逻辑

### 删除操作
- [ ] 已标记 deprecated 至少一个版本周期
- [ ] 已确认无消费者使用该字段
- [ ] 保留migration回滚脚本

### 类型转换规则
| 从 → 到 | 是否安全 |
|---------|---------|
| INT → BIGINT | ✅ 安全扩展 |
| VARCHAR(50) → VARCHAR(100) | ✅ 安全扩展 |
| VARCHAR(100) → VARCHAR(50) | ❌ 可能截断 |
| INT → STRING | ⚠️ 需要转换逻辑 |
| STRING → INT | ⚠️ 需要验证 |
```

## Footguns（Schema 演变常见陷阱）

### 常见错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| **直接删除列** | `DROP COLUMN old_field` | 先标记 deprecated，等至少一个版本 |
| **NOT NULL 无默认值** | `ADD col TEXT NOT NULL` | `ADD col TEXT DEFAULT 'unknown'` |
| **缩小类型** | `INT → SMALLINT` | 仅在确认数据范围后操作 |
| **删除枚举值** | `status: 'pending'` 被移除 | 保留旧值，标记 deprecated |
| **改变默认值语义** | `is_active DEFAULT true → false` | 仅在确认业务影响后 |
| **字段重命名一步到位** | 直接 `RENAME col_a TO col_b` | 先添加新字段，双写，再删除 |
| **忽略消费者** | 假设所有消费者同时更新 | 使用版本过渡期 |

### 真实事故案例

```sql
-- ❌ 事故1：直接删除列导致生产事故
-- 错误做法
ALTER TABLE orders DROP COLUMN discount_code;
-- 结果：所有依赖该列的查询和报告失败

-- ✅ 正确做法
-- Phase 1: 标记 deprecated
ALTER TABLE orders ALTER COLUMN discount_code SET DEFAULT NULL;
COMMENT ON COLUMN orders.discount_code IS 'DEPRECATED: use discount_id instead. Will be removed in Q3 2026.';

-- Phase 2: 等至少一个版本周期，确认无消费者
-- Phase 3: 删除
ALTER TABLE orders DROP COLUMN discount_code;

-- ❌ 事故2：添加 NOT NULL 列无默认值
-- 错误做法
ALTER TABLE orders ADD COLUMN priority VARCHAR(20) NOT NULL;
-- 结果：PostgreSQL 会 rewrite table，锁表 30 分钟

-- ✅ 正确做法
ALTER TABLE orders ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
-- PostgreSQL 立即完成，不锁表
```

### 数据迁移中的 Footguns

```python
# ❌ 错误：在大表上直接 UPDATE
def bad_migration():
    # 这会锁表并产生大量 WAL
    cursor.execute("UPDATE orders SET new_price = old_price * 1.1")

# ✅ 正确：分批 UPDATE
def good_migration(batch_size=1000):
    last_id = 0
    while True:
        cursor.execute("""
            UPDATE orders
            SET new_price = old_price * 1.1
            WHERE id > %s AND id <= %s
        """, [last_id, last_id + batch_size])

        if cursor.rowcount == 0:
            break
        last_id += batch_size
        time.sleep(0.1)  # 让出 CPU

# ❌ 错误：在事务中添加 NOT NULL 约束
def bad_constraint_add():
    BEGIN
    ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
    COMMIT
    -- 这会锁表

# ✅ 正确：分两步，先添加检查约束
def good_constraint_add():
    BEGIN
    -- 先添加不被强制执行的约束
    ALTER TABLE orders ADD CONSTRAINT chk_status CHECK (status IS NOT NULL) NOT VALID;
    COMMIT

    -- 再验证现有数据
    ALTER TABLE orders VALIDATE CONSTRAINT chk_status;
```

### 时区处理 Footgun

```python
# ❌ 错误：假设所有环境时区一致
created_at = datetime.now()  # 本地时区
cursor.execute("INSERT INTO orders VALUES (%s)", [created_at])

# ✅ 正确：统一使用 UTC
created_at = datetime.now(timezone.utc)
cursor.execute("INSERT INTO orders VALUES (%s)", [created_at])

# ⚠️ 边界情况：存储 TIMESTAMPTZ vs TIMESTAMP
# TIMESTAMPTZ: PostgreSQL 自动转换时区，显示时按 session timezone
# TIMESTAMP: MySQL/PostgreSQL 都按字面值存储

# 推荐：统一用 TIMESTAMPTZ 存储，TIMESTAMP 显示
```

## Consumer 协调策略

### 灰度升级模式

```
Timeline:
T0: Producer v2 发布，支持新旧两种字段格式
T1: Consumer A 升级到 v2
T2: Consumer B 升级到 v2
T3: Consumer C 升级到 v2
T4: 确认所有消费者已升级
T5: Producer v3 发布，移除旧字段支持
```

### Schema Registry 强制策略

```json
{
  "compatibility": "BACKWARD_TRANSITIVE",
  "validRules": [
    {
      "name": "no-breaking-changes",
      "type": "COMPATIBILITY",
      "spec": {
        "allowedChanges": [
          "ADD_FIELD",
          "ADD_DEFAULT_VALUE",
          "OPTIONAL_TO_OPTIONAL"
        ],
        "deniedChanges": [
          "REMOVE_FIELD",
          "CHANGE_FIELD_TYPE",
          "ADD_REQUIRED_FIELD"
        ]
      }
    }
  ]
}
```

### Consumer 处理未知字段的正确方式

```python
# ✅ 正确的反序列化代码（必须忽略未知字段）
import json
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class OrderEvent:
    order_id: str
    email: str
    # 使用 extra='ignore' 或 dataclass_fields 自动处理
    extra: dict = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict):
        # 显式处理，确保未知字段被忽略
        known_fields = {'order_id', 'email', 'preferences', 'created_at'}
        extra = {k: v for k, v in data.items() if k not in known_fields}
        return cls(
            order_id=data['order_id'],
            email=data['email'],
            extra=extra
        )

# ❌ 错误的反序列化（strict 模式）
def bad_deserializer(data: dict):
    # 如果 schema 增加字段，这里会 KeyError
    return {
        'order_id': data['order_id'],
        'email': data['email']
    }
```

# Example

**Input:**

```
schema_context: Kafka event schema
change: 'Add optional priority field, later make it required'
```

**Output:**

```markdown
## Compatibility
Adding `priority` as optional with default `normal` is backward-compatible.

## Phased Rollout
1. Update producer schema to include optional `priority`.
2. Update consumers to read `priority` with default fallback.
3. After all consumers are updated, make `priority` required.
4. Remove default fallback in consumers after 2 weeks.
```
