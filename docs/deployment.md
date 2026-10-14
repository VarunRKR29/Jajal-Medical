# Cloud Deployment Architecture (AWS Production Guide)

**System**: MedCase - Medical Case Management Application  
**Target Environment**: Amazon Web Services (AWS) Production Architecture  
**Company**: @Jajal Medical  

---

## 1. High-Level Architecture Overview

```text
  [ Users / Browsers / API Clients ]
                 |
             HTTPS (Port 443)
                 v
   [ AWS Route 53 (DNS) + AWS Certificate Manager (ACM SSL) ]
                 |
                 v
   [ Application Load Balancer (ALB) ] (Public Subnet)
                 |
      +----------+----------+ (Forward to Private Subnet)
      |                     |
      v                     v
 [ EC2 Instance 1 ]   [ EC2 Instance 2 ]  (Auto Scaling Group)
 (Nginx + PHP-FPM /   (Nginx + PHP-FPM /
  Node / Laravel)      Node / Laravel)
      |                     |
      +----------+----------+
                 |
                 +-----> [ Amazon S3 + CloudFront ] (DICOM / 3D CAD mesh files)
                 |
                 +-----> [ AWS Secrets Manager / SSM ] (DB credentials, APP_KEY)
                 |
                 v
   [ Amazon RDS MySQL (Multi-AZ) ] (Isolated Database Private Subnet)
```

---

## 2. Infrastructure Components

### 1. App Tier: Amazon EC2 with Auto Scaling
- **Instance Sizing**: `t4g.small` or `c7g.medium` (AWS Graviton3) with Ubuntu 24.04 LTS.
- **Web Server Stack**: Nginx reverse proxy with PHP-FPM / Node.js supervisor (`supervisord` or `systemd`).
- **Deployment Process**: Code packaged via GitHub Actions / AWS CodePipeline, running `composer install --no-dev --optimize-autoloader` and `php artisan config:cache`, `route:cache`, `view:cache`.

### 2. Database Tier: Amazon RDS for MySQL (Multi-AZ)
- **Engine**: MySQL 8.0 with Multi-AZ automated replication across two Availability Zones for automatic failover and zero data loss.
- **Storage**: General Purpose SSD (gp3) with automated daily snapshots and point-in-time recovery (PITR) with a 30-day retention window.
- **Backups**: Encrypted at rest using AWS KMS (`aws/rds`).

### 3. File & Medical Imaging Storage: Amazon S3
- **Object Storage**: S3 bucket with Server-Side Encryption (`AES-256` / SSE-KMS).
- **Security**: Public Access Blocked completely; pre-signed URLs with expiring TTL (15 minutes) for authorized surgeons to download surgical models and DICOM files.
- **Lifecycle Rules**: Transition older case attachments to S3 Standard-IA (Infrequent Access) after 90 days.

---

## 3. Network Security & Security Groups

Strict least-privilege network isolation across three tiers:

1. **ALB Security Group (`sg-alb`)**:
   - Inbound: Ports `80` (HTTP redirects to 443) and `443` (HTTPS) from `0.0.0.0/0`.
   - Outbound: Port `80` / `3000` to `sg-ec2`.
2. **EC2 Application Security Group (`sg-ec2`)**:
   - Inbound: Port `80` / `3000` ONLY from `sg-alb`.
   - Inbound: Port `22` (SSH) restricted to internal VPN or AWS Systems Manager (SSM) Session Manager (no public SSH port exposed).
   - Outbound: All traffic or restricted to RDS and S3 endpoints.
3. **RDS Database Security Group (`sg-rds`)**:
   - Inbound: Port `3306` (MySQL) ONLY from `sg-ec2`.
   - Outbound: None.

---

## 4. Secrets Management & Environment Configuration

- **Zero Secrets in Git**: No `.env` files, passwords, or database credentials committed to version control.
- **AWS Secrets Manager / SSM Parameter Store**:
  - Securely injects `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_KEY`, and Sanctum signing keys directly into the environment during instance launch.
  - Automated rotation of database master credentials every 90 days.

---

## 5. HTTPS & SSL/TLS Configuration

- **SSL Certificates**: Free, automatically renewing wildcard certificates provisioned via **AWS Certificate Manager (ACM)**.
- **Enforcement**: ALB configured to immediately return HTTP `301 Moved Permanently` redirecting all plain HTTP traffic to `https://`.
- **Modern Cipher Suites**: Enforce TLS 1.3 and TLS 1.2 with HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`).
