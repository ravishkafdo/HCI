const mongoose = require('mongoose');

const RoomDesignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Design name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    items: {
      type: Array,
      required: true
    },
    wallColors: {
      type: Object,
      default: {
        all: "#E0E0E0",
        front: "#E0E0E0",
        back: "#E0E0E0",
        left: "#D3D3D3",
        right: "#D3D3D3"
      }
    },
    floorColor: {
      type: String,
      default: "#BFBFBF"
    },
    dimensions: {
      type: Object,
      default: {
        width: 20,
        depth: 20,
        height: 5
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoomDesign', RoomDesignSchema); 