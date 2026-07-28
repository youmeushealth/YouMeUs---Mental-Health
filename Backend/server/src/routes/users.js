import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

/* ===============================
   👥 Follow status for an author
================================ */
router.get("/:id/follow-status", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID format",
      });
    }

    const author = await User.findById(req.params.id).select("followers");
    if (!author) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        following: author.followers.some(
          (id) => id.toString() === req.user._id.toString()
        ),
        followerCount: author.followers.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   👥 Follow / Unfollow an author
================================ */
router.post("/:id/follow", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID format",
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You cannot follow yourself",
      });
    }

    const author = await User.findById(id);
    if (!author) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const followerCount = await author.toggleFollow(req.user._id);
    const following = author.followers.some(
      (followerId) => followerId.toString() === req.user._id.toString()
    );

    res.status(200).json({
      status: "success",
      data: { following, followerCount },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
