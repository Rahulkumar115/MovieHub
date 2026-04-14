# SeatSync 🎬 | Real-Time Movie Ticketing Platform

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

A full-stack, type-safe movie booking application engineered to handle real-world concurrent user traffic. Built with Next.js and MongoDB, this platform features a robust database seat-locking mechanism to prevent race conditions, secure webhook-driven payments, and automated digital ticket generation.

## 🚀 Key Features

* **Real-Time Concurrency Control:** Implemented a pessimistic database locking system with a 10-minute TTL (Time-To-Live). This prevents race conditions and double-bookings when multiple users attempt to checkout the same seat simultaneously.
* **Secure Payment Webhooks:** Integrated the Razorpay payment gateway with server-side webhooks (`payment.captured`) to autonomously verify live transactions and synchronize database states securely.
* **Serverless Notification Engine:** Built a Node.js microservice utilizing the Resend API to automatically compile and dispatch HTML-formatted digital tickets to users upon payment success.
* **Dynamic Media Catalog:** Connected to the TMDB API to fetch and display real-time, high-definition movie metadata and imagery.
* **Secure Authentication:** Implemented NextAuth.js for seamless and secure Google OAuth user authentication.

## 🛠️ Tech Stack

* **Frontend:** Next.js (React), Tailwind CSS, TypeScript
* **Backend:** Next.js API Routes, Node.js
* **Database & ORM:** MongoDB, Prisma
* **Integrations:** Razorpay (Payments), Resend (Transactional Emails), TMDB (Media API)
* **Deployment:** Render

## 🏗️ Architecture: The 10-Minute Seat Lock
To solve the classic ticketing "race condition," the database utilizes a three-state architecture (`AVAILABLE`, `LOCKED`, `BOOKED`). 
1. When User A selects a seat, the Prisma ORM updates the status to `LOCKED` and attaches a 10-minute timestamp. 
2. If User B attempts to select the seat, the backend rejects the request. 
3. Upon successful payment, a Razorpay webhook permanently updates the status to `BOOKED`. If the timer expires without payment, the seat automatically reverts to `AVAILABLE`.

## 💻 Local Setup Instructions

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/moviehub.git](https://github.com/yourusername/moviehub.git)
cd moviehub