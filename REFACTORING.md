Important things : 
ROLES
- Buyer
- Tenant
- Admin
- Seller/Owner
- Employees of easeyourestate which admin can create 

First refactor #1
- After submitting of the property listing by the owner remove the "Save as draft" and keep submit 
- After submit it will get submitted to admin and a popup message says that "Your property is under review and will get live within 48hrs"
- If admin approves an SMS should go to the Owner/seller registered mobile no that your property is succesfully listed , You can view here : Unique Link
- And if rejects then just show in the user dashboard when he will login

Second refactor #2 
- When the buyer or tenant searches for property and click on "Get owner details" 
- Here are two scenarios , if the user is not signedup/loggedin take to that flow and then ask consent of the user to share contact details to easeyourestate team and the team will contact you soon 
- If the user says "yes" then in the requests section of the admin add a row with proper details 
- Add a export button to export in proper csv ( add proper utility to do that ) 

At admin section 
- The team will call the respective requester user to cross-verify things and if all goes well then the admin will approve the request and a SMS will go to user with the respective owner details and a SMS will go to owner that a user has requested for your property [property summary detail]

Third refactor #3
- Admin can create employees 
- Can manage which sections are visible and which are not 
Basically access rights

Fourth refactor #4
- Restructure property listing creation form and changes within it : 
1. Listing type and classification
2. Project name / Apartment name and Location ( In location ask address in 1 line,state,landmark,city,pincode )
3. Specifications 
    - Carpet area instead of super..
    - No of balcony
    - Facing direction ( Dropdown )
    - No of floors
    - Floor no ( on which the flat is )
4. Pricing and terms ( For rent write rent (including maintaenance) and remove seperate maintaenance field )
- In rent type in preferred tenants include dropdown having these 
  - Bachelor ( Male or female ) then ( working or student )
  - Family 
5. Change the "Save as draft" button to "Submit" 
- After submit a popup ( Standard UI ) saying 'Your property is under review and your listing will be livee in 24-48 hrs'


Fifth Refactoring #5 - Admin
- Admin can create employees 
- Can manage which sections are visible and which are not 
Basically access rights
- Also admin should be able to see the properties detail before approving 
- Also improvise the UI at the admin side as some theming issues are there 
- Remove the subscriptions,reports section from admin