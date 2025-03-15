import express, { Request, Response, NextFunction } from 'express';

const inspector = (req: Request, res: Response, next: NextFunction) => {
    console.log(
      `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
    );
    next();
  };
  
  export default inspector;