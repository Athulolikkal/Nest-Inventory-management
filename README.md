# Inventory API

## Overview
The Inventory API is a NestJS-based service for managing inventory synchronization and slot availability for products. It provides endpoints for fetching inventory details, managing scheduled tasks, and retrieving slot information.

## Base URL
All endpoints are prefixed with:
```http
/api/v1/
```

## Endpoints

### **Sync Inventory**
#### **Fetch Inventory Data for Next Two Months**
**Endpoint:**
```http
GET /api/v1/experience/sync-db
```
**Description:**
Synchronizes the inventory data for the next two months.

---

### **Slot Management**
#### **Get Product Slots by Date**
**Endpoint:**
```http
GET /api/v1/experience/:id/slots
```
**Query Parameters:**
- `date` (string, required) - The date for which slot details are requested.

**Path Parameters:**
- `id` (number, required) - The product ID.

**Description:**
Fetches available slot details for a product on a given date.

---

#### **Get Available Dates for a Product**
**Endpoint:**
```http
GET /api/v1/experience/:id/dates
```
**Path Parameters:**
- `id` (number, required) - The product ID.

**Description:**
Retrieves all available dates for a given product.

---

### **Schedule Management**
#### **Pause Inventory Synchronization**
**Endpoint:**
```http
POST /api/v1/experience/schedule/pause
```
**Request Body:**
```json
{
  "jobName": "string"
}
```
**Description:**
Pauses the scheduled inventory synchronization task.

---

#### **Resume Inventory Synchronization**
**Endpoint:**
```http
POST /api/v1/experience/schedule/resume
```
**Request Body:**
```json
{
  "jobName": "string"
}
```
**Description:**
Resumes the paused inventory synchronization task.

---

#### **Check Job Status**
**Endpoint:**
```http
GET /api/v1/experience/schedule/status/:jobName
```
**Path Parameters:**
- `jobName` (string, required) - The name of the scheduled job.

**Response:**
```json
{
  "jobName": "running | paused"
}
```
**Description:**
Returns the current status of the scheduled job.

---

## Setup and Installation
1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the application:
   ```sh
   npm run start:dev
   ```

