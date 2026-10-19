# Add and update project doctors directly in MongoDB

Edit `data/demo-doctors.json`, then run from healthcare-backend:

```powershell
npm run seed:doctors
```

This script connects directly to MONGODB_URI from your backend .env. It does not
click the frontend or call the HTTP API. The four existing demo doctor accounts
are identified by email and will be updated, preserving their MongoDB IDs and
passwords. Missing accounts are created with hashed random passwords; the script
prints each new account's initial password once.

Change names, department, fee, qualification, experience, isActive, days or slots
in the JSON and rerun the command. Use the department names you already created.
The current General Madicine spelling matches your saved department.

Email is the matching key: keep it unchanged when editing an existing doctor.
Changing it creates a new account. Removing a row does not delete the account;
set isActive to false and rerun to disable it. Rerunning applies all the file's
listed profile values, including schedules and active status.

Validate the JSON without connecting or writing to MongoDB:

```powershell
npm run seed:doctors -- --validate
```

The script checks the file before writing and verifies all department references
and account roles before updates. If a database failure happens during the write
loop, some rows can already be saved; rerunning safely matches the same emails.
No actual hospital details, admin accounts, patients or other records are deleted.

The four demo accounts were already created before this script was added.
Their current test logins are:

| Email | Initial demo password |
| --- | --- |
| vasudev@sscare.example.com | VasuDemo!4827 |
| anjali@sscare.example.com | AnjaliDemo!5938 |
| rahul@sscare.example.com | RahulDemo!6849 |
| meera@sscare.example.com | MeeraDemo!7951 |

These are fictional project accounts, not production credentials. The seed file
contains no passwords. Keep your actual connection string private in .env.
