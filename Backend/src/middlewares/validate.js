import { HttpError } from "../utils/httpError";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    return next(
      new HttpError(400, "Validation error", parsed.error.flatten().fieldErrors)
    );
  }
  req[source] = parsed.data;
  next();
};
