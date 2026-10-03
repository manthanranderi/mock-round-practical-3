# Event Slot Booker (Node.js + Express + MongoDB)

Backend-only REST API: event slots banao, students ko book karwao, cancel karo.

## Setup
```bash
npm install
# .env me MONGO_URI check karo (MongoDB local ya Atlas)
npm run dev      # nodemon se, ya: npm start
```
Server: http://localhost:5000

## APIs
| Method | Endpoint | Kaam |
|---|---|---|
| POST | /api/slots | Slot create (validation: capacity > 0, required fields) |
| GET | /api/slots | Saare slots + availableSeats |
| GET | /api/slots/:id | Single slot + activeBookings |
| POST | /api/slots/:id/book | Slot book (Open check, duplicate email, full check) |
| GET | /api/slots/:id/bookings | Slot ki active bookings |
| PATCH | /api/bookings/:id/cancel | Booking cancel (seat free) |
| DELETE | /api/slots/:id | Slot delete (active bookings ho to block) |

## Sample bodies
**POST /api/slots**
```json
{ "eventName": "Node.js Workshop", "date": "2026-11-10", "startTime": "10:00", "endTime": "12:00", "location": "Lab 1", "capacity": 2 }
```
**POST /api/slots/:id/book**
```json
{ "studentName": "Rahul Patel", "email": "rahul@example.com", "rollNo": "101" }
```

## Postman Testing Checklist
1. `Event_Slot_Booker.postman_collection.json` Postman me import karo (slotId / bookingId automatic save hote hain).
2. Kam se kam 2 slots banao (alag capacity ke saath).
3. Multiple students book karo.
4. Same email se dobara book karo -> **409** "already booked".
5. Capacity bhar do, phir next booking -> **400** "Full Slot".
6. Ek booking cancel karo -> availableSeats +1, phir new booking chal jayegi.
7. Invalid ID (`/api/slots/123`) -> **400**; missing fields -> **400**; unknown ID -> **404**.
8. Active bookings wale slot ko delete karo -> **409** blocked.

## Logic Notes
- Capacity aur duplicate check me sirf `bookingStatus: "Booked"` count hota hai.
- `availableSeats = capacity - activeBookings`.
- Booking model me partial unique index hai (slotId + email, sirf Booked pe), jisse race condition me bhi duplicate nahi banta; cancelled hone ke baad same email dobara book kar sakta hai.
- Status `Closed` ho to booking nahi hoti.
