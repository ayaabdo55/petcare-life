-- PetCare Life — MySQL Schema
-- Run this file once to set up your database:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS petcareapp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE petcareapp_db;

-- ─────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(80)  NOT NULL UNIQUE,
  email      VARCHAR(120) NOT NULL UNIQUE,
  password   VARCHAR(256) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  CLINICS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinics (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  category    VARCHAR(60)   NOT NULL,
  address     VARCHAR(200)  NOT NULL,
  phone       VARCHAR(40)   NOT NULL,
  hours       VARCHAR(100)  NOT NULL,
  services    VARCHAR(200)  NOT NULL,
  rating      DECIMAL(2,1)  NOT NULL DEFAULT 0.0,
  reviews     INT           NOT NULL DEFAULT 0,
  badge       VARCHAR(60)   NOT NULL DEFAULT 'General Practice',
  badge_color VARCHAR(20)   NOT NULL DEFAULT 'badge-teal',
  description TEXT          NOT NULL,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  STORES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  category    VARCHAR(60)   NOT NULL,
  address     VARCHAR(200)  NOT NULL,
  phone       VARCHAR(40)   NOT NULL,
  hours       VARCHAR(100)  NOT NULL,
  products    VARCHAR(200)  NOT NULL,
  rating      DECIMAL(2,1)  NOT NULL DEFAULT 0.0,
  reviews     INT           NOT NULL DEFAULT 0,
  badge       VARCHAR(60)   NOT NULL DEFAULT 'General Store',
  badge_color VARCHAR(20)   NOT NULL DEFAULT 'badge-pink',
  description TEXT          NOT NULL,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  clinic_name VARCHAR(120) NOT NULL,
  pet_name    VARCHAR(80)  NOT NULL,
  pet_type    VARCHAR(40)  NOT NULL,
  visit_date  DATE         NOT NULL,
  reason      TEXT         NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
--  SEED DATA — Clinics
-- ─────────────────────────────────────────
INSERT INTO clinics (name, category, address, phone, hours, services, rating, reviews, badge, badge_color, description) VALUES
('PawHealth Veterinary Center',  'general',    '12 Road 9, Maadi, Cairo',            '+20 2 2345 6789', 'Sat-Thu 9AM-9PM, Fri 10AM-6PM',      'Check-ups, Vaccines, Dental, Surgery',           4.8, 312,'General Practice',    'badge-teal',   'Full-service veterinary clinic offering routine check-ups, vaccinations, dental care, and minor surgeries. Experienced team with state-of-the-art equipment.'),
('CriticalCare Animal Hospital', 'emergency',  '45 Al Nozha St, Heliopolis',         '+20 2 2222 9999', 'Open 24/7 - Emergency Line Available', 'Emergency Surgery, ICU, Imaging, Toxicology',    4.9, 520, '24/7 Emergency',      'badge-pink',   'Round-the-clock emergency veterinary services. Equipped with ICU, surgical suites, and diagnostic imaging for critical cases.'),
('Advanced Pet Specialists',     'specialist', '8 Hassan Sabry St, Zamalek',         '+20 2 2736 1200', 'Sun-Thu 10AM-8PM',                    'Oncology, Cardiology, Orthopedics',              4.7, 198, 'Specialist',          'badge-purple', 'Specialist veterinary care including oncology, orthopedics, cardiology, and ophthalmology. Referrals welcome.'),
('Happy Paws Clinic',            'general',    '22 Gamaet El Dowal, Mohandessin',    '+20 2 3760 4455', 'Daily 8AM-10PM',                      'Wellness Plans, Microchipping, Behaviour',       4.6, 287, 'General Practice',    'badge-yellow', 'Friendly neighborhood clinic known for gentle handling and affordable care. Offers wellness plans, microchipping, and behavioural consultations.'),
('Exotic & Avian Care Center',   'exotic',     '5 Abbas El Akkad, Nasr City',        '+20 2 2402 8877', 'Sat-Thu 11AM-7PM',                    'Birds, Reptiles, Rabbits, Small Mammals',        4.8, 143, 'Exotic Animals',      'badge-teal',   'Specialist care for birds, reptiles, rabbits, and exotic pets. Expert vets trained in avian and small mammal medicine.'),
('The Cat Clinic',               'specialist', '3rd Settlement, New Cairo',          '+20 2 2617 3300', 'Daily 10AM-8PM',                      'Feline Internal Med, Dermatology, Seniors',      4.9, 410, 'Feline Specialist',   'badge-pink',   'A calm, cat-only environment designed to reduce feline stress. Specialists in internal medicine, dermatology, and senior cat care.'),
('VetPlus Family Clinic',        'general',    'Al Hosary Square, 6th October City', '+20 38 375 2211', 'Sat-Thu 9AM-8PM',                     'General Care, Vaccines, Deworming, Spay/Neuter', 4.5, 176, 'General Practice',    'badge-teal',   'Comprehensive family vet serving dogs, cats, and small animals. Affordable pricing with flexible appointment scheduling.'),
('PetMed 24 Hospital',           'emergency',  'Mesaha Square, Dokki, Giza',         '+20 2 3761 5000', '24 Hours, 7 Days a Week',             'Emergency, Hospitalization, Rehab, Boarding',    4.7, 392, 'Emergency + Boarding','badge-yellow', 'Full-service animal hospital with emergency care, hospitalization, rehabilitation, and boarding. Over 15 years of trusted service.');

-- ─────────────────────────────────────────
--  SEED DATA — Stores
-- ─────────────────────────────────────────
INSERT INTO stores (name, category, address, phone, hours, products, rating, reviews, badge, badge_color, description) VALUES
('PetWorld Megastore',       'superstore',  'City Stars Mall, Phase 2, Nasr City', '+20 2 2480 1122', 'Daily 10AM-11PM',  'Food, Toys, Accessories, Aquarium, Grooming',      4.7, 624, 'Superstore',          'badge-pink',   'Egypts largest pet superstore with over 5,000 products. Food, accessories, toys, grooming, aquarium supplies, and in-store vets on weekends.'),
('NutriPet Store',           'food',        'Road 233, Maadi Degla',               '+20 2 2380 5566', 'Daily 9AM-9PM',    'Premium Food, Raw Diets, Prescription Nutrition',  4.8, 389, 'Food & Nutrition',    'badge-teal',   'Specializing in premium, natural, and prescription pet food. Wide selection of raw diets, grain-free options, and veterinary nutrition products.'),
('Fluffy & Fresh Grooming',  'grooming',    '15 Ismail Mohamed St, Zamalek',       '+20 2 2735 9988', 'Sat-Thu 10AM-8PM', 'Full Grooming, Bath, Nail Trim + Retail Shop',     4.9, 278, 'Grooming & Spa',      'badge-purple', 'Premium grooming studio and product boutique. Full grooming services plus retail of shampoos, brushes, nail tools, and styling accessories.'),
('Paws & Style Boutique',    'accessories', 'Triumph Square, Heliopolis',          '+20 2 2418 7744', 'Daily 11AM-9PM',   'Collars, Clothing, Beds, Carriers, Jewelry',       4.6, 203, 'Accessories',         'badge-yellow', 'Trendy pet accessories including designer collars, leashes, beds, clothing, carriers, and personalized pet jewelry.'),
('GreenPaw Organic Shop',    'food',        'The Village Mall, New Cairo',         '+20 2 2613 4400', 'Sat-Thu 10AM-7PM', 'Organic Food, Supplements, Eco Accessories',       4.7, 155, 'Organic & Natural',   'badge-teal',   'Eco-friendly and organic pet products. Chemical-free food, biodegradable accessories, natural supplements, and herbal treatments.'),
('AquaLife & Exotic Pets',   'superstore',  'Syria Street, Mohandessin',           '+20 2 3748 6633', 'Daily 9AM-10PM',   'Aquariums, Fish, Reptiles, Birds, Exotic Supplies', 4.5, 341, 'Aquarium & Exotic',   'badge-pink',   'Cairos top destination for aquarium setups, tropical fish, reptiles, birds, and all exotic pet supplies. Expert advice available in-store.'),
('Playful Pets Toy Store',   'accessories', 'Juhayna Square, 6th October City',    '+20 38 392 7788', 'Sat-Thu 10AM-9PM', 'Toys, Puzzle Feeders, Agility, Enrichment',        4.6, 187, 'Toys & Play',         'badge-teal',   'Dedicated to pet entertainment! Interactive toys, puzzle feeders, agility equipment, and enrichment products for all breeds and sizes.'),
('PawSpa Supply House',      'grooming',    'Tahrir Square Area, Dokki',           '+20 2 3749 0011', 'Sat-Thu 9AM-7PM',  'Clippers, Shampoos, Dental & Ear Care',            4.4, 122, 'Grooming Supplies',   'badge-yellow', 'Wholesale and retail grooming supplies for professionals and pet owners. Clippers, shampoos, dental care, and ear cleaning products.');





SELECT * from users;
SELECT * from bookings;