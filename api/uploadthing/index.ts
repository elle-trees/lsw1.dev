import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./router";

// Export the route handler for Vercel
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

