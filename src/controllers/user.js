import { User } from "../models";
import * as Yup from "yup";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class UserController {
  async login(req, res) {
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid e-mail.")
          .required("E-mail is mandatory."),
        password: Yup.string()
          .required("Password is mandatory.")
          .min(6, "Password should have 6 or more characters."),
      });

      const user = await User.findOne({ where: { email: req.body.email } });

      if (!user) {
        return res.status(401).json({ error: "Incorrect email or password." });
      }

      const checkPassword = await bcrypt.compare(
        req.body.password,
        user.password_hash
      );

      if (!checkPassword) {
        return res.status(401).json({ error: "Incorrect email or password." });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_HASH, {
        expiresIn: "30 days",
      });

      const { id, name, email, avatar_url, createdAt } = user;

      return res.json({
        id,
        name,
        email,
        avatar_url,
        createdAt,
        token,
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async create(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string()
          .required("Name is mandatory.")
          .min(3, "Name should have 3 or more characters."),
        email: Yup.string()
          .email("Invalid e-mail.")
          .required("E-mail is mandatory."),
        password: Yup.string()
          .required("Password is mandatory.")
          .min(6, "Password should have 6 or more characters."),
      });

      await schema.validate(req.body);

      const userExists = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExists) {
        return res.status(400).json({ error: "E-mail already exists." });
      }

      const hashPassword = await bcrypt.hash(req.body.password, 8);

      const user = new User({
        ...req.body,
        password: "",
        password_hash: hashPassword,
      });

      await user.save();

      return res.json({ user });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async getUser(req, res) {
    try {
      if (!req.userId) {
        return res.status(400).json({ error: "Id not provided." });
      }

      const user = await User.findOne({ where: { id: Number(req.userId) } });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async forgotPassword(req, res) {}
}

export default new UserController();
