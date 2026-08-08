const shipModel = require("../Models/ship.model")


async function getAllShips(req,res){
    try {
        const ships = await shipModel.find()
        res.status(200).json(ships)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function addShip(req,res){
    const {name,x,y,speed,status} = req.body
   if(!name || x === undefined || y === undefined){
        return res.status(400).json({message: "All fields are required"})
    }
    try {
        const ship = await shipModel.create({name,x,y,speed,status})
        res.status(201).json(ship)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function deleteShip(req,res){
    try {
        const ship = await shipModel.findByIdAndDelete(req.params.id)
        res.status(200).json(ship)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {getAllShips,addShip,deleteShip}

