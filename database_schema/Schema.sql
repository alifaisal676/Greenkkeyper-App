CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

CREATE TABLE Vehicle (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    year INT,
    status VARCHAR(20),
    assigned_driver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_driver_id) REFERENCES User(user_id)
);

CREATE TABLE ChecklistTemplate (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE ChecklistItem (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT,
    item_text VARCHAR(255) NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (template_id) REFERENCES ChecklistTemplate(template_id)
);

CREATE TABLE Inspection (
    inspection_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    driver_id INT,
    template_id INT,
    inspection_type VARCHAR(10), -- BOD/EOD
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    image_url TEXT,
    digital_signature TEXT,
    status VARCHAR(20),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    FOREIGN KEY (driver_id) REFERENCES User(user_id),
    FOREIGN KEY (template_id) REFERENCES ChecklistTemplate(template_id)
);

CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);
