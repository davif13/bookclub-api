import { User } from "../models";
import { differenceInHours } from "date-fns";
import * as Yup from "yup";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Mail from "../libs/Mail";
import UploadImage from "../libs/UploadImage";

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

  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().min(3, "Name should have 3 or more characters."),
        email: Yup.string().email("Invalid e-mail."),
        password: Yup.string().min(
          6,
          "Password should have 6 or more characters."
        ),
      });

      await schema.validate(req.body);
      const { name, email, password } = req.body;

      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (name) {
        user.name = name;
      }

      if (email) {
        user.email = email;
      }

      if (password) {
        user.password_hash = await bcrypt.hash(password, 8);
      }

      await user.save();

      return res.json({ user });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async updateAvatar(req, res) {
    try {
      const schema = Yup.object().shape({
        base64: Yup.string().required("Base64 is mandatory."),
        mime: Yup.string().required("Mime is mandatory."),
      });

      await schema.validate(req.body);
      const { base64, mime } = req.body;

      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (user.avatar_url) {
        const splitted = user.avatar_url.split("/");
        const oldKey = splitted[splitted.length - 1];
        const deleteResponse = await UploadImage.delete(oldKey);
        if (deleteResponse?.error) {
          return res.status(500).json({ error: deleteResponse });
        }
      }

      const key = `user_${user.id}_${new Date().getTime()}`;
      const response = await UploadImage.upload(key, base64, mime);

      if (response?.error) {
        return res
          .status(400)
          .json({ error: "Error while uploading the image" });
      }

      user.avatar_url = response?.Location;

      await user.save();

      return res.status(200).json(user);
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

  async forgotPassword(req, res) {
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid e-mail.")
          .required("E-mail is mandatory."),
      });

      await schema.validate(req.body);

      const user = User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const reset_password_sent_at = new Date();
      const token = Math.random.toString.slice(2, 8);
      const reset_password_token = await bcrypt.hash(token, 8);

      await user.update({
        reset_password_sent_at,
        reset_password_token,
      });

      const { email, name } = user;

      const mailResult = await Mail.sendForgotPasswordEmail(email, name, token);

      if (mailResult?.error) {
        return res.status(400).json({ error: "E-mail não enviado" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid e-mail.")
          .required("E-mail is mandatory."),
        token: Yup.string().required("Token is mandatory."),
        password: Yup.string()
          .required("Password is mandatory.")
          .min(6, "Password should have 6 or more characters."),
      });

      await schema.validate(req.body);

      const user = User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (!user.reset_password_token && !user.reset_password_sent_at) {
        return res
          .status(400)
          .json({ error: "Password change was not requested." });
      }

      const hoursDifference = differenceInHours(
        new Date(),
        user.reset_password_sent_at
      );

      if (hoursDifference > 3) {
        return res.status(401).json({ error: "Expired token." });
      }

      const checkToken = await bcrypt.compare(
        req.body.token,
        user.reset_password_token
      );

      if (!checkToken) {
        return res.status(401).json({ error: "Invalid token." });
      }

      const password_hash = await bcrypt.hash(req.body.password, 8);

      await user.update({
        password_hash,
        reset_password_token: null,
        reset_password_sent_at: null,
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new UserController();
