# Ohannah Cabin - Complete Usage Guide

## 📖 Table of Contents
1. [USER GUIDE](#user-guide) - How guests book cabins
2. [ADMIN GUIDE](#admin-guide) - How to manage the business

---

## USER GUIDE

### For Guests: How to Book Your Stay

#### **Step 1: Visit the Website**
- Go to the public website URL (e.g., `https://ohannahcabin.com`)
- You'll see the landing page with:
  - Hero section with "Book Now" button
  - About section describing the cabins
  - Amenities highlights
  - Photo gallery
  - Contact information

#### **Step 2: Start the Booking Process**
- Click the **"Book Now"** button on the Hero section (top of page)
- Or navigate using the Header menu and select "Booking"
- You'll enter the reservation form

#### **Step 3: Choose Stay Category (Step 1)**
- Select one of two options:
  - **Full Stay**: Multi-day stay (check-in one day, check-out another day)
  - **Daycation/Evening**: 
    - Morning: 9 AM - 7 AM next day
    - Evening: 9 PM - 7 AM next day
- This determines your pricing and time slots

#### **Step 4: Select Your Cabin (Step 2)**
- Choose between:
  - **Ohannah Cabin**
  - **The Dream**
- Each cabin has different features and pricing

#### **Step 5: Pick Your Dates (Step 3)**
- Click on the calendar to select dates
- can click = Available
- have a color and past dates = Already booked (unavailable)
- For Full Stay: select check-in date, then check-out date
- For Daycation/Evening: select just the date
- The system automatically prevents double-booking

#### **Step 6: Enter Guest Details (Step 4)**
Fill in your booking information:
(Rate is good for 4 adults and 2 kids additional 300 per pax if full stay 500)
- **Number of Guests**: How many adults up to 12 
- **Kids**: below 3ft
- **Pets**: Do you have pets?
- **Special Occasion**: (Optional)
  - Honeymoon
  - Birthday
  - Anniversary
  - Other
- **Color Preference**:
  - Select your preferred color its for range of the guest to know each book has a different book

#### **Step 7: Review Price Summary (Right Sidebar)**
- See the breakdown:
  - Nightly rate
  - Number of nights
  - Subtotal
  - Discounts (if applicable)
  - **Total Price**
- "Price per night may vary by season"

#### **Step 8: Create an Account (if needed)**
- Click "Book Now" button
- If not logged in, you'll be redirected to **Auth Page**
- Choose login method:
  - **Email/Password**:
    - Enter email
    - Enter password
    - Click "Sign In" or "Create Account" (if new)
  - **Google Sign-In**:
    - Click Google icon
    - Complete Google authentication
    - You're automatically logged in

#### **Step 9: Confirm Your Booking**
- After authentication, you'll see **Booking Confirmation**
- Shows:
  - Booking reference number
  - Cabin name & dates
  - Total amount
  - Confirmation status
- **Email confirmation** is sent automatically

#### **Step 10: View Your Booking in Profile**
- Click your profile icon in the header
- Go to **"My Bookings"** or **"My Profile"**
- You can see:
  - All your upcoming bookings
  - Booking dates and cabin details
  - Booking status
  - Payment status (if integrated)
  - **Admin Message** (if admin left a note)

---

## ADMIN GUIDE

### For Managers: How to Control the Business

#### **Step 1: Access the Admin Dashboard**

**From your computer:**
- Go to `https://ohannahcabin.com/admin.html` (live deployment)
- Or visit the admin-specific URL your hosting provides

**You'll see the Admin Login page** with:
- Branding: "Ohannah Admin"
- Email field (placeholder: admin@ohannahcabin.com)
- Password field (Security Key)
- Forgot Password option

#### **Step 2: Log In with Admin Credentials**

**Requirements:**
- Must have a valid **Firebase email account**
- Must be registered in the `admins` collection in Firestore
- Must have `role: "admin"` in your admin profile

**To log in:**
1. Enter your admin email
2. Enter your admin password
3. Click "Verify & Enter"
4. Wait for verification (shows "Identity Verified. Accessing Terminal...")
5. Dashboard loads

**If login fails:**
- **Wrong email/password**: "Wrong email or password."
- **Not admin**: "RESTRICTED: You are not in the Admin Registry."
- Click "Forgot Password?" to reset your password

#### **Step 3: Explore the Admin Dashboard Sidebar**

On the left side, you have **5 management tabs**:

1. **📥 Bookings** - View and manage all reservations
2. **📅 Calendar** - Visual calendar of all bookings
3. **📈 Analytics** - Booking statistics and insights
4. **💰 Rates** - Set and adjust cabin pricing
5. **🏷️ Discounts** - Create and manage discount codes

---

### **Tab 1: Bookings Management**

#### What You Can See:
- **Complete list of all bookings** (newest first)
- Each booking shows:
  - Guest name
  - Cabin name (Ohannah or The Dream)
  - Check-in date
  - Check-out date
  - Number of guests, kids, pets
  - Total price
  - Current status (Pending, Confirmed, Cancelled, etc.)
  - Guest email & phone

#### What You Can Do:

**Update Booking Status:**
1. Find the booking you want to update
2. Click the status button (Pending, Confirmed, Cancelled, etc.)
3. Select new status:
   - `Pending` - Awaiting confirmation
   - `Confirmed` - Approved booking
   - `Cancelled` - Guest cancelled
   - `No-Show` - Guest didn't arrive
4. (Optional) Add an admin message
   - Message will appear in guest's profile
   - Example: "We've upgraded you to cabin view!"
5. Click "Update" - changes save immediately

**Delete a Booking:**
1. Find the booking
2. Click the **"Delete"** or **"🗑️"** button
3. Confirm deletion
4. Booking is removed from system

**Bulk Actions:**
- Select multiple bookings with checkboxes
- Delete multiple at once
- Update status for multiple bookings

---

### **Tab 2: Calendar View**

#### What You Can See:
- **Full calendar** showing all booked dates
- Each booking displayed on the calendar:
  - Color-coded by status
  - Shows guest names
  - Shows cabin names

#### What You Can Do:
- **Visual overview** of occupancy
- **Spot conflicts or gaps** in bookings
- **Plan maintenance** during vacant dates
- **Check seasonal demand**

---

### **Tab 3: Analytics**

#### What You Can See:

**Booking Statistics:**
- Total number of bookings
- Bookings by cabin (Ohannah vs The Dream)
- Bookings by time period

**Charts & Graphs:**
- Booking trends over time
- Revenue per cabin
- Occupancy rates
- Guest statistics

#### What You Can Do:
- **Analyze patterns**:
  - Which months are busiest?
  - Which cabin books more?
  - Average stay length
- **Make business decisions**:
  - Adjust rates during peak season
  - Plan marketing for slow periods
  - Identify popular dates

---

### **Tab 4: Rates (Pricing Management)**

#### What You Can See:
- Current pricing for each cabin:
  - **Ohannah Cabin**: Base rate per night
  - **The Dream**: Base rate per night
- Pricing by season or special dates (if configured)

#### What You Can Do:

**Update Nightly Rates:**
1. Click on the cabin's rate field
2. Enter new price
3. Click "Save"
4. Price updates immediately

**Example:**
```
Ohannah Cabin:
- Regular: $150/night
- Peak Season (June-Aug): $200/night
- Off-Season (Jan-Feb): $120/night
```

**Set Special Pricing:**
- Holiday rates (Christmas, New Year, Thanksgiving)
- Weekend vs weekday rates
- Long-stay discounts (e.g., 7+ nights = 10% off)

---

### **Tab 5: Discounts (Promotion Management)**

#### What You Can See:
- List of all active discount codes
- Each code shows:
  - Code name
  - Discount percentage or amount
  - Expiry date
  - How many times used

#### What You Can Do:

**Create a New Discount:**
1. Click "Create Discount"
2. Fill in:
   - **Code**: e.g., "SUMMER2024"
   - **Discount Type**: Percentage (20%) or Fixed ($30 off)
   - **Discount Value**: 20 or 30
   - **Expiry Date**: When it expires
   - **Max Uses**: (optional) Limit how many times code can be used
   - **Applicable Cabins**: Which cabin(s) it applies to
3. Click "Create"
4. Code is live immediately

**Example Discounts You Could Create:**
- `EARLY10` = 10% off for bookings 30+ days in advance
- `WEEKDAY20` = 20% off for Mon-Thu bookings
- `HONEYMOON` = 15% off for honeymoon packages
- `BIRTHDAY` = $50 off for birthday stays

**Edit a Discount:**
1. Click on the discount code
2. Modify any field
3. Click "Update"

**Delete a Discount:**
1. Click the discount
2. Click "Delete"
3. Code is no longer usable

---

### **Step 4: Monitoring Guest Activity**

**Guest Profiles:**
- Each booking links to the guest's profile
- You can see:
  - Guest name, email, phone
  - Past bookings history
  - Any special preferences noted
  - Payment information (if stored)

**Notifications:**
- New bookings appear in real-time
- Status updates sync instantly
- Alerts for upcoming check-ins

---

### **Step 5: Logout**

When finished:
1. Click the **"Logout"** button (bottom of sidebar)
2. Confirm logout in modal
3. Redirected to login screen
4. Your session ends securely

---

## 🔄 Common Workflows

### **Workflow A: Accept & Confirm a Booking**
1. Go to **Bookings** tab
2. Find the booking (status: "Pending")
3. Click status button
4. Select "Confirmed"
5. (Optional) Add message: "We look forward to your stay!"
6. Save
7. Guest receives confirmation

### **Workflow B: Run a Summer Promo**
1. Go to **Rates** tab
2. Update Ohannah Cabin: $150 → $180 (peak pricing)
3. Go to **Discounts** tab
4. Create `EARLY20`: 20% off for bookings 60+ days in advance
5. Create `LASTMIN15`: 15% off for bookings within 7 days
6. Bookings automatically apply discounts

### **Workflow C: Handle a Cancellation**
1. Go to **Bookings** tab
2. Find the booking
3. Click status button
4. Select "Cancelled"
5. Add message: "Cancellation processed. Refund issued within 3-5 business days."
6. Save
7. Guest sees cancellation notice in profile

### **Workflow D: Analyze Slow Season**
1. Go to **Analytics** tab
2. Check booking charts
3. Note low occupancy in January-February
4. Go to **Rates** tab
5. Lower prices for February (e.g., $100/night)
6. Go to **Discounts** tab
7. Create `WINTER40`: 40% off in Feb
8. Promote discount to attract guests

---

## 🚨 Important Notes

### **For Users:**
- Booking confirmation email is sent automatically
- Check your spam folder if you don't see it
- You can modify your booking by contacting us via Contact page
- Check your profile for any admin messages about your stay

### **For Admins:**
- Admin access is role-restricted (checked every login)
- Always confirm bookings before guest arrival
- Update guest notes/messages to communicate with guests
- Monitor analytics monthly to adjust strategy
- Backup your discount codes and rates regularly
- Log out after each session for security

---

## 📞 Support

**For Guests:**
- Questions? Use the Contact form on the website
- Or email the contact listed on the footer

**For Admins:**
- Technical issues? Check Firebase console
- Need to reset admin access? Contact the developer
- Firestore database issues? Check Firestore in Firebase console

---

**Last Updated:** June 2026
**Version:** 1.0
