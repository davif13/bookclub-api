import { Router } from "express";
import UserController from "../controllers/user";
import authMiddleware from "../middlewares/auth";
import CategoryController from "../controllers/category";
import AuthorController from "../controllers/author";
import BookController from "../controllers/book";
import UserBookController from "../controllers/userbook";
import SearchController from "../controllers/search";
const routes = new Router();

// -----unauthenticated routes-----
routes.post("/user", UserController.create);
routes.post("/login", UserController.login);
routes.post("/forgot-password", UserController.forgotPassword);
routes.post("/reset-password", UserController.resetPassword);

// -----authenticated routes-----
routes.use(authMiddleware);
routes.get("/user", UserController.getUser);
routes.get("/category", CategoryController.getAll);

routes.post("/author", AuthorController.create);
routes.get("/author", AuthorController.getAll);
routes.get("/author/:id", AuthorController.get);

routes.post("/book", BookController.create);
routes.get("/book", BookController.getAll);

routes.post("/userbook", UserBookController.create);
routes.get("/userbook", UserBookController.getAll);
routes.delete("/userbook/:id", UserBookController.delete);
routes.get("/search", SearchController.get);

export default routes;
