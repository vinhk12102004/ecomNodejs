import { z } from "zod";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const data = source === "query" ? req.query : req.body;
      const validatedData = schema.parse(data);
      
      if (source === "query") {
        req.query = validatedData;
      } else {
        req.body = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return res.status(400).json({ error: errorMessage });
      }
      next(error);
    }
  };
};
