# Vikunja Tasks to iCal

This is a small Node.js application that allows you to convert Vikunja tasks into iCal format, enabling integration into any calendar.

USAGE: <br/>

1. Clone the repository to your VM with preinstalled Node.js:
   
   `git clone <repo_url>`
   
2. Install PM2 globally:
   
   `npm install -g pm2`
   
3. Navigate to the project folder and install dependencies:
   
   `cd <project_folder>`
   `npm install`
   
4. Create a .env file.

The .env file must contain the following variables:
```
JWT_TOKEN=your_api_token
AUTH_TOKEN=secret_to_get_iCal_via_url
URL=http(s)://domain_or_ip
```
5. Transpile TypeScript to JavaScript:
   
   `npm run build`
   
6. Start the PM2 process:
   
   `npm run deploy`
   
7. Save the PM2 state:
   
   `pm2 save`
   