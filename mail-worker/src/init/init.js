import settingService from '../service/setting-service';
import emailUtils from '../utils/email-utils';
import {emailConst} from "../const/entity-const";
const init = {
	async init(c) {

		const secret = c.req.param('secret');

		if (secret !== c.env.jwt_secret) {
			return c.text('secret不匹配');
		}

		await this.intDB(c);
		await this.v1_1DB(c);
		await this.v1_2DB(c);
		await this.v1_3DB(c);
		await this.v1_3_1DB(c);
		await this.v1_4DB(c);  // 新增：环境变量支持
		await settingService.refresh(c);
		return c.text('初始化成功');
	},

	async v1_3_1DB(c) {
		await c.env.db.prepare(`UPDATE email SET name = SUBSTR(send_email, 1, INSTR(send_email, '@') - 1) WHERE (name IS NULL OR name = '') AND type = ${emailConst.type.RECEIVE}`).run();
	},

	async v1_4DB(c) {
		// 添加环境变量支持所需的字段
		const ADD_COLUMN_SQL_LIST = [
			`ALTER TABLE setting ADD COLUMN send INTEGER DEFAULT 1;`,
			`ALTER TABLE setting ADD COLUMN login_opacity REAL DEFAULT 0.88;`,
			`ALTER TABLE setting ADD COLUMN r2_domain TEXT;`,
			`ALTER TABLE setting ADD COLUMN site_key TEXT;`,
			`ALTER TABLE setting ADD COLUMN secret_key TEXT;`,
			`ALTER TABLE setting ADD COLUMN background TEXT;`,
			`ALTER TABLE setting ADD COLUMN resend_tokens TEXT DEFAULT '{}';`
		];

		for (const sql of ADD_COLUMN_SQL_LIST) {
			try {
				await c.env.db.prepare(sql).run();
			} catch (e) {
				// 字段已存在，忽略错误
				console.log('Column already exists:', e.message);
			}
		}

		// 从环境变量更新设置（如果设置表已存在）
		const existingSetting = await c.env.db.prepare(`SELECT COUNT(*) as count FROM setting`).first();
		if (existingSetting && existingSetting.count > 0) {
			// 从环境变量读取配置
			const envConfig = {
				register: c.env.register ?? null,
				receive: c.env.receive ?? null,
				send: c.env.send ?? null,
				add_email: c.env.add_email ?? null,
				many_email: c.env.many_email ?? null,
				title: c.env.title ?? null,
				auto_refresh_time: c.env.auto_refresh_time ?? null,
				register_verify: c.env.register_verify ?? null,
				add_email_verify: c.env.add_email_verify ?? null,
				login_opacity: c.env.login_opacity ?? null,
				r2_domain: c.env.r2_domain ?? null,
				site_key: c.env.turnstile_site_key ?? null,
				secret_key: c.env.turnstile_secret_key ?? null,
				tg_bot_token: c.env.tg_bot_token ?? null,
				tg_chat_id: c.env.tg_chat_id ?? null,
				tg_bot_status: c.env.tg_bot_status ?? null,
				forward_email: c.env.forward_email ?? null,
				forward_status: c.env.forward_status ?? null,
				rule_email: c.env.rule_email ?? null,
				rule_type: c.env.rule_type ?? null
			};

			// 处理 Resend Tokens
			const resendTokens = {};
			if (c.env.domain && Array.isArray(c.env.domain)) {
				c.env.domain.forEach(domain => {
					const tokenKey = `resend_token_${domain.replace(/\./g, '_')}`;
					if (c.env[tokenKey]) {
						resendTokens[domain] = c.env[tokenKey];
					}
				});
			}

			// 构建更新SQL
			const updateFields = [];
			const updateValues = [];

			Object.keys(envConfig).forEach(key => {
				if (envConfig[key] !== null) {
					updateFields.push(`${key} = ?`);
					updateValues.push(envConfig[key]);
				}
			});

			if (Object.keys(resendTokens).length > 0) {
				updateFields.push(`resend_tokens = ?`);
				updateValues.push(JSON.stringify(resendTokens));
			}

			if (updateFields.length > 0) {
				const updateSQL = `UPDATE setting SET ${updateFields.join(', ')}`;
				await c.env.db.prepare(updateSQL).bind(...updateValues).run();
			}
		}
	},

	async v1_3DB(c) {

		const ADD_COLUMN_SQL_LIST = [
			`ALTER TABLE setting ADD COLUMN tg_bot_token TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE setting ADD COLUMN tg_chat_id TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE setting ADD COLUMN tg_bot_status INTEGER NOT NULL DEFAULT 1;`,
			`ALTER TABLE setting ADD COLUMN forward_email TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE setting ADD COLUMN forward_status INTEGER TIME NOT NULL DEFAULT 1;`,
			`ALTER TABLE setting ADD COLUMN rule_email TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE setting ADD COLUMN rule_type INTEGER NOT NULL DEFAULT 0;`
		];

		for (let sql of ADD_COLUMN_SQL_LIST) {
			try {
				await c.env.db.prepare(sql).run();
			} catch (e) {
				console.warn(`跳过字段添加，原因：${e.message}`);
			}
		}

		const nameColumn = await c.env.db.prepare(`SELECT * FROM pragma_table_info('email') WHERE name = 'to_email' limit 1`).first();

		if (nameColumn) {
			return
		}

		const queryList = []

		queryList.push(c.env.db.prepare(`ALTER TABLE email ADD COLUMN to_email TEXT NOT NULL DEFAULT ''`));
		queryList.push(c.env.db.prepare(`ALTER TABLE email ADD COLUMN to_name TEXT NOT NULL DEFAULT ''`));
		queryList.push(c.env.db.prepare(`UPDATE email SET to_email = json_extract(recipient, '$[0].address'), to_name = json_extract(recipient, '$[0].name')`));

		await c.env.db.batch(queryList);

	},

	async v1_2DB(c){

		const ADD_COLUMN_SQL_LIST = [
			`ALTER TABLE email ADD COLUMN recipient TEXT NOT NULL DEFAULT '[]';`,
			`ALTER TABLE email ADD COLUMN cc TEXT NOT NULL DEFAULT '[]';`,
			`ALTER TABLE email ADD COLUMN bcc TEXT NOT NULL DEFAULT '[]';`,
			`ALTER TABLE email ADD COLUMN message_id TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE email ADD COLUMN in_reply_to TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE email ADD COLUMN relation TEXT NOT NULL DEFAULT '';`
		];

		for (let sql of ADD_COLUMN_SQL_LIST) {
			try {
				await c.env.db.prepare(sql).run();
			} catch (e) {
				console.warn(`跳过字段添加，原因：${e.message}`);
			}
		}

		await this.receiveEmailToRecipient(c);
		await this.initAccountName(c);

		try {
			await c.env.db.prepare(`
        INSERT INTO perm (perm_id, name, perm_key, pid, type, sort) VALUES
        (31,'分析页', NULL, 0, 1, 2.1),
        (32,'数据查看', 'analysis:query', 31, 2, 1)`).run();
		} catch (e) {
			console.warn(`跳过数据，原因：${e.message}`);
		}

		try {
			await c.env.db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_account_email ON account (email)`).run();
			await c.env.db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON user (email)`).run();
		} catch (e) {
			console.warn(`跳过添加唯一邮箱索引，原因：${e.message}`);
		}

	},

	async v1_1DB(c) {
		// 添加字段
		const ADD_COLUMN_SQL_LIST = [
			`ALTER TABLE email ADD COLUMN type INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE email ADD COLUMN status INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE email ADD COLUMN resend_email_id TEXT;`,
			`ALTER TABLE email ADD COLUMN message TEXT;`,

			`ALTER TABLE setting ADD COLUMN resend_tokens TEXT NOT NULL DEFAULT '{}';`,
			`ALTER TABLE setting ADD COLUMN send INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE setting ADD COLUMN r2_domain TEXT;`,
			`ALTER TABLE setting ADD COLUMN site_key TEXT;`,
			`ALTER TABLE setting ADD COLUMN secret_key TEXT;`,
			`ALTER TABLE setting ADD COLUMN background TEXT;`,
			`ALTER TABLE setting ADD COLUMN login_opacity INTEGER NOT NULL DEFAULT 0.88;`,

			`ALTER TABLE user ADD COLUMN create_ip TEXT;`,
			`ALTER TABLE user ADD COLUMN active_ip TEXT;`,
			`ALTER TABLE user ADD COLUMN os TEXT;`,
			`ALTER TABLE user ADD COLUMN browser TEXT;`,
			`ALTER TABLE user ADD COLUMN device TEXT;`,
			`ALTER TABLE user ADD COLUMN sort INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE user ADD COLUMN send_count INTEGER NOT NULL DEFAULT 0;`,

			`ALTER TABLE attachments ADD COLUMN status INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE attachments ADD COLUMN type INTEGER NOT NULL DEFAULT 0;`
		];

		for (let sql of ADD_COLUMN_SQL_LIST) {
			try {
				await c.env.db.prepare(sql).run();
			} catch (e) {
				console.warn(`跳过字段添加，原因：${e.message}`);
			}
		}

		// 创建 perm 表并初始化
		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS perm (
        perm_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        perm_key TEXT,
        pid INTEGER NOT NULL DEFAULT 0,
        type INTEGER NOT NULL DEFAULT 2,
        sort INTEGER
      )
    `).run();

		const {permTotal} = await c.env.db.prepare(`SELECT COUNT(*) as permTotal FROM perm`).first();

		if (permTotal === 0) {
			await c.env.db.prepare(`
        INSERT INTO perm (perm_id, name, perm_key, pid, type, sort) VALUES
        (1, '邮件', NULL, 0, 0, 0),
        (2, '邮件删除', 'email:delete', 1, 2, 1),
        (3, '邮件发送', 'email:send', 1, 2, 0),
        (4, '个人设置', '', 0, 1, 2),
        (5, '用户注销', 'my:delete', 4, 2, 0),
        (6, '用户信息', NULL, 0, 1, 3),
        (7, '用户查看', 'user:query', 6, 2, 0),
        (8, '密码修改', 'user:set-pwd', 6, 2, 2),
        (9, '状态修改', 'user:set-status', 6, 2, 3),
        (10, '权限修改', 'user:set-type', 6, 2, 4),
        (11, '用户删除', 'user:delete', 6, 2, 7),
        (12, '用户收藏', 'user:star', 6, 2, 5),
        (13, '权限控制', '', 0, 1, 5),
        (14, '身份查看', 'role:query', 13, 2, 0),
        (15, '身份修改', 'role:set', 13, 2, 1),
        (16, '身份删除', 'role:delete', 13, 2, 2),
        (17, '系统设置', '', 0, 1, 6),
        (18, '设置查看', 'setting:query', 17, 2, 0),
        (19, '设置修改', 'setting:set', 17, 2, 1),
        (20, '物理清空', 'setting:clean', 17, 2, 2),
        (21, '邮箱侧栏', '', 0, 0, 1),
        (22, '邮箱查看', 'account:query', 21, 2, 0),
        (23, '邮箱添加', 'account:add', 21, 2, 1),
        (24, '邮箱删除', 'account:delete', 21, 2, 2),
        (25, '用户添加', 'user:add', 6, 2, 1),
        (26, '发件重置', 'user:reset-send', 6, 2, 6),
        (27, '邮件列表', '', 0, 1, 4),
        (28, '邮件查看', 'sys-email:query', 27, 2, 0),
        (29, '邮件删除', 'sys-email:delete', 27, 2, 0),
				(30, '身份添加', 'role:add', 13, 2, -1)
      `).run();
		}

		await c.env.db.prepare(`UPDATE perm SET perm_key = 'setting:clean' WHERE perm_key = 'seting:clear'`).run();
		await c.env.db.prepare(`DELETE FROM perm WHERE perm_key = 'user:star'`).run();
		// 创建 role 表并插入默认身份
		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS role (
        role_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        key TEXT,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        sort INTEGER DEFAULT 0,
        description TEXT,
        user_id INTEGER,
        is_default INTEGER DEFAULT 0,
        send_count INTEGER,
        send_type TEXT NOT NULL DEFAULT 'count',
        account_count INTEGER
      )
    `).run();

		const { roleCount } = await c.env.db.prepare(`SELECT COUNT(*) as roleCount FROM role`).first();
		if (roleCount === 0) {
			await c.env.db.prepare(`
        INSERT INTO role (
          role_id, name, key, create_time, sort, description, user_id, is_default, send_count, send_type, account_count
        ) VALUES (
          1, '普通用户', NULL, '0000-00-00 00:00:00', 0, '只有普通使用权限', 0, 1, NULL, 'count', 10
        )
      `).run();
		}

		// 创建 role_perm 表并初始化数据
		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS role_perm (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER,
        perm_id INTEGER
      )
    `).run();

		const {rolePermCount} = await c.env.db.prepare(`SELECT COUNT(*) as rolePermCount FROM role_perm`).first();
		if (rolePermCount === 0) {
			await c.env.db.prepare(`
        INSERT INTO role_perm (id, role_id, perm_id) VALUES
          (100, 1, 2),
          (101, 1, 21),
          (102, 1, 22),
          (103, 1, 23),
          (104, 1, 24),
          (105, 1, 4),
          (106, 1, 5),
          (107, 1, 1)
      `).run();
		}
	},

	async intDB(c) {
		// 初始化数据库表结构
		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS email (
        email_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        send_email TEXT,
        name TEXT,
        account_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        subject TEXT,
        content TEXT,
        text TEXT,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        is_del INTEGER DEFAULT 0 NOT NULL
      )
    `).run();

		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS star (
        star_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email_id INTEGER NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();

		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS attachments (
        att_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        filename TEXT,
        mime_type TEXT,
        size INTEGER,
        disposition TEXT,
        related TEXT,
        content_id TEXT,
        encoding TEXT,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();

		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS user (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        type INTEGER DEFAULT 1 NOT NULL,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        status INTEGER DEFAULT 0 NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        active_time DATETIME,
        is_del INTEGER DEFAULT 0 NOT NULL
      )
    `).run();

		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS account (
        account_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        status INTEGER DEFAULT 0 NOT NULL,
        latest_email_time DATETIME,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        is_del INTEGER DEFAULT 0 NOT NULL
      )
    `).run();

		await c.env.db.prepare(`
      CREATE TABLE IF NOT EXISTS setting (
        register INTEGER NOT NULL,
        receive INTEGER NOT NULL,
        send INTEGER DEFAULT 1 NOT NULL,
        add_email INTEGER NOT NULL,
        many_email INTEGER NOT NULL,
        title TEXT NOT NULL,
        auto_refresh_time INTEGER NOT NULL,
        register_verify INTEGER NOT NULL,
        add_email_verify INTEGER NOT NULL,
        login_opacity REAL DEFAULT 0.88,
        r2_domain TEXT,
        site_key TEXT,
        secret_key TEXT,
        background TEXT,
        tg_bot_token TEXT DEFAULT '',
        tg_chat_id TEXT DEFAULT '',
        tg_bot_status INTEGER DEFAULT 1,
        forward_email TEXT DEFAULT '',
        forward_status INTEGER DEFAULT 1,
        rule_email TEXT DEFAULT '',
        rule_type INTEGER DEFAULT 0,
        resend_tokens TEXT DEFAULT '{}'
      )
    `).run();

		// 从环境变量读取配置，如果没有则使用默认值
		const envConfig = {
			register: c.env.register ?? 0,
			receive: c.env.receive ?? 0,
			send: c.env.send ?? 0,
			add_email: c.env.add_email ?? 0,
			many_email: c.env.many_email ?? 1,
			title: c.env.title ?? 'Cloud 邮箱',
			auto_refresh_time: c.env.auto_refresh_time ?? 0,
			register_verify: c.env.register_verify ?? 1,
			add_email_verify: c.env.add_email_verify ?? 1,
			login_opacity: c.env.login_opacity ?? 0.88,
			r2_domain: c.env.r2_domain ?? '',
			site_key: c.env.turnstile_site_key ?? '',
			secret_key: c.env.turnstile_secret_key ?? '',
			tg_bot_token: c.env.tg_bot_token ?? '',
			tg_chat_id: c.env.tg_chat_id ?? '',
			tg_bot_status: c.env.tg_bot_status ?? 1,
			forward_email: c.env.forward_email ?? '',
			forward_status: c.env.forward_status ?? 1,
			rule_email: c.env.rule_email ?? '',
			rule_type: c.env.rule_type ?? 0
		};

		// 处理 Resend Tokens
		const resendTokens = {};
		if (c.env.domain && Array.isArray(c.env.domain)) {
			c.env.domain.forEach(domain => {
				const tokenKey = `resend_token_${domain.replace(/\./g, '_')}`;
				if (c.env[tokenKey]) {
					resendTokens[domain] = c.env[tokenKey];
				}
			});
		}

		await c.env.db.prepare(`
      INSERT INTO setting (
        register, receive, send, add_email, many_email, title, auto_refresh_time,
        register_verify, add_email_verify, login_opacity, r2_domain, site_key,
        secret_key, tg_bot_token, tg_chat_id, tg_bot_status, forward_email,
        forward_status, rule_email, rule_type, resend_tokens
      )
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM setting)
    `).bind(
			envConfig.register,
			envConfig.receive,
			envConfig.send,
			envConfig.add_email,
			envConfig.many_email,
			envConfig.title,
			envConfig.auto_refresh_time,
			envConfig.register_verify,
			envConfig.add_email_verify,
			envConfig.login_opacity,
			envConfig.r2_domain,
			envConfig.site_key,
			envConfig.secret_key,
			envConfig.tg_bot_token,
			envConfig.tg_chat_id,
			envConfig.tg_bot_status,
			envConfig.forward_email,
			envConfig.forward_status,
			envConfig.rule_email,
			envConfig.rule_type,
			JSON.stringify(resendTokens)
		).run();
	},

	async receiveEmailToRecipient(c) {

		const receiveEmailColumn = await c.env.db.prepare(`SELECT * FROM pragma_table_info('email') WHERE name = 'receive_email' limit 1`).first();

		if (!receiveEmailColumn) {
			return
		}

		const queryList = []
		const {results} = await c.env.db.prepare('SELECT receive_email,email_id FROM email').all();
		results.forEach(emailRow => {
			const recipient = {}
			recipient.address = emailRow.receive_email
			recipient.name = ''
			const recipientStr = JSON.stringify([recipient]);
			const sql = c.env.db.prepare('UPDATE email SET recipient = ? WHERE email_id = ?').bind(recipientStr,emailRow.email_id);
			queryList.push(sql)
		})

		queryList.push(c.env.db.prepare("ALTER TABLE email DROP COLUMN receive_email"));

		await c.env.db.batch(queryList);
	},


	async initAccountName(c) {

		const nameColumn = await c.env.db.prepare(`SELECT * FROM pragma_table_info('account') WHERE name = 'name' limit 1`).first();

		if (nameColumn) {
			return
		}

		const queryList = []

		queryList.push(c.env.db.prepare(`ALTER TABLE account ADD COLUMN name TEXT NOT NULL DEFAULT ''`));

		const {results} = await c.env.db.prepare(`SELECT account_id, email FROM account`).all();

		results.forEach(accountRow => {
			const name = emailUtils.getName(accountRow.email);
			const sql = c.env.db.prepare('UPDATE account SET name = ? WHERE account_id = ?').bind(name,accountRow.account_id);
			queryList.push(sql)
		})

		await c.env.db.batch(queryList);
	}
};

export default init;
