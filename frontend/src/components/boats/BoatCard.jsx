import React from "react";
import StatusTag from "../basic/StatusTag";
import { Link } from "react-router-dom";
import "./BoatCard.scss";

function BoatCard({ ...boat }) {
	// const url = import.meta.env.VITE_BACKEND + "/" + boat.pic;
	return (
		<Link to={`/boats/${boat["_id"]}`}>
			<div className="BoatCard">
				<img className="ship" src={boat.img.url} alt={boat.name} />
				<h4>{boat.boatID}</h4>
				<h3>{boat.name}</h3>
				<div>
					<h5>{boat.year}</h5>
					<h5>{boat.type}</h5>
				</div>
				<StatusTag content={boat.status} />
			</div>
		</Link>
	);
}

export default BoatCard;
