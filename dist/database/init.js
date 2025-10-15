"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_1 = __importDefault(require("./connection"));
const DDL_STATEMENTS = [
    {
        name: 'admins',
        sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `,
    },
    {
        name: 'agencies',
        sql: `
      CREATE TABLE IF NOT EXISTS agencies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(255) NULL,
        address VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        zip_code VARCHAR(20) NULL,
        phone VARCHAR(25) NULL,
        email VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `,
    },
    {
        name: 'users',
        sql: `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        firebase_uid VARCHAR(128) UNIQUE NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        phone VARCHAR(25) NULL,
        address VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        role ENUM('client', 'broker', 'admin') DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `,
    },
    {
        name: 'brokers',
        sql: `
      CREATE TABLE IF NOT EXISTS brokers (
        id INT PRIMARY KEY,
        creci VARCHAR(50) NOT NULL UNIQUE,
        status ENUM('pending_verification', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending_verification',
        agency_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL,
        INDEX idx_brokers_status (status),
        INDEX idx_brokers_agency (agency_id)
      );
    `,
    },
    {
        name: 'properties',
        sql: `
      CREATE TABLE IF NOT EXISTS properties (
        id INT PRIMARY KEY AUTO_INCREMENT,
        broker_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(100) NOT NULL,
        purpose VARCHAR(100) NOT NULL,
        status ENUM('pending_approval', 'approved', 'rejected', 'rented', 'sold') NOT NULL DEFAULT 'pending_approval',
        price DECIMAL(12, 2) NOT NULL,
        code VARCHAR(100) NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        quadra VARCHAR(255) NULL,
        lote VARCHAR(255) NULL,
        numero VARCHAR(50) NULL,
        bairro VARCHAR(255) NULL,
        complemento TEXT NULL,
        tipo_lote ENUM('meio', 'inteiro') NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        bedrooms INT NULL,
        bathrooms INT NULL,
        area_construida DECIMAL(10, 2) NULL,
        area_terreno DECIMAL(10, 2) NULL,
        garage_spots INT NULL,
        has_wifi TINYINT(1) DEFAULT 0,
        tem_piscina TINYINT(1) DEFAULT 0,
        tem_energia_solar TINYINT(1) DEFAULT 0,
        tem_automacao TINYINT(1) DEFAULT 0,
        tem_ar_condicionado TINYINT(1) DEFAULT 0,
        eh_mobiliada TINYINT(1) DEFAULT 0,
        valor_condominio DECIMAL(10, 2) NULL,
        valor_iptu DECIMAL(10, 2) NULL,
        video_url VARCHAR(255) NULL,
        sale_value DECIMAL(12, 2) NULL,
        commission_rate DECIMAL(5, 2) NULL,
        commission_value DECIMAL(12, 2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE,
        INDEX idx_properties_status (status),
        INDEX idx_properties_city (city),
        INDEX idx_properties_bairro (bairro)
      );
    `,
    },
    {
        name: 'property_images',
        sql: `
      CREATE TABLE IF NOT EXISTS property_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        property_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        INDEX idx_property_images_property (property_id)
      );
    `,
    },
    {
        name: 'sales',
        sql: `
      CREATE TABLE IF NOT EXISTS sales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        property_id INT NOT NULL,
        broker_id INT NOT NULL,
        sale_price DECIMAL(12, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
        commission_amount DECIMAL(12, 2) NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE,
        INDEX idx_sales_property (property_id),
        INDEX idx_sales_broker (broker_id)
      );
    `,
    },
    {
        name: 'broker_documents',
        sql: `
      CREATE TABLE IF NOT EXISTS broker_documents (
        broker_id INT PRIMARY KEY,
        creci_front_url VARCHAR(255) NOT NULL,
        creci_back_url VARCHAR(255) NOT NULL,
        selfie_url VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE
      );
    `,
    },
    {
        name: 'notifications',
        sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        related_entity_type ENUM('property', 'broker') NOT NULL,
        related_entity_id INT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE,
        INDEX idx_notifications_user (user_id),
        INDEX idx_notifications_entity (related_entity_type, related_entity_id)
      );
    `,
    },
    {
        name: 'user_favorites',
        sql: `
      CREATE TABLE IF NOT EXISTS user_favorites (
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, property_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      );
    `,
    },
];
async function ensureDefaultAdmin() {
    const defaultEmail = 'admin@imobiliaria.com';
    const defaultPassword = 'admin123';
    const [existingAdmin] = await connection_1.default.query('SELECT id FROM admins WHERE email = ?', [defaultEmail]);
    if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(defaultPassword, 8);
    await connection_1.default.query('INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)', ['Admin Padrão', defaultEmail, passwordHash]);
}
async function createTables() {
    try {
        for (const ddl of DDL_STATEMENTS) {
            console.log(`Verificando tabela ${ddl.name}...`);
            await connection_1.default.query(ddl.sql);
        }
        await ensureDefaultAdmin();
        console.log('Estrutura do banco de dados verificada com sucesso!');
    }
    catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
    }
    finally {
        await connection_1.default.end();
    }
}
void createTables();
