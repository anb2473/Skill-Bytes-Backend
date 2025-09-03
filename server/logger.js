import winston from 'winston';

// You will get this from your environment variables
const isProduction = process.env.NODE_ENV === 'production';

const transports = [
  // Always log to the console (stdout/stderr) in production
  new winston.transports.Console()
];

// Add file transports only for development
if (!isProduction) {
  transports.push(
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/info.log', 
      level: 'info' 
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: transports
});

export default logger;