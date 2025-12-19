import { OO } from "../../globals";
import ResultItem from "./ResultItem";
// <nowiki>

class ResultList {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Object[]} config.availableResults relevant result objects from data.js
	 *  @param {String[]} config.pageNames
	 *  @param {String} [config.venueType] venue type (e.g. "cfd", "afd")
	 */
	constructor(config) {
		// call mixin constructors
		OO.EventEmitter.call(this);
		OO.EmitterList.call(this);
		this.addItems(
			config.pageNames.map(pageName => new ResultItem({
				availableResults: config.availableResults,
				pageName: pageName,
				venueType: config.venueType
			}))
		);
		this.aggregate({"update": "itemUpdate"});
		this.connect(this, {itemUpdate: ["emit", "update"]});
	}

	onItemUpdate() {
		this.emit("update");
	}
}
OO.initClass( ResultList );
OO.mixinClass( ResultList, OO.EventEmitter );
OO.mixinClass( ResultList, OO.EmitterList );

export default ResultList;
// </nowiki>