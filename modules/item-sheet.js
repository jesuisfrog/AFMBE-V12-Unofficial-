export class afmbeItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["afmbe", "sheet", "item"],
            width: 600,
            height: 450,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body-items", initial: "description"}]
        })
    }

    /* -------------------------------------------- */

    /** @override */
    get template() {
        const path = "systems/afmbe/templates";
        return `${path}/${this.item.data.type}-sheet.html`;
    }

    getData() {
        const  data = super.getData(); 
        data.dtypes = ["String", "Number", "Boolean"];
        data.isGM = game.user.isGM;
        data.editable = data.options.editable;
        const itemData = data.data;
        data.actor = itemData;
        data.data = itemData.data;

        return data;
        }

/* -------------------------------------------- */

    /** @override */
    setPosition(options={}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    /**
   * Handle clickables
   * @param {Event} event   The originating click event
   * @private
   */



}