export class afmbeActor extends Actor {
    async _preCreate(data, options, user) {
      await super._preCreate(data, options, user);
      if (data.type === "character") {
        this.data.token.update({vision: true, actorLink: true, disposition: 1})
      }
    }

    prepareData() {
        super.prepareData()
        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;

        if (actorData.type === 'character') {this._prepareCharacterData(actorData)}
        if (actorData.type === 'creature') {this._prepareCreatureData(actorData)}
        if (actorData.type === 'vehicle') {this._prepareVehicleData(actorData)}
    }

    _prepareCharacterData(actorData) {
      const data = actorData.data

      // Set Character Point Values
      let chaTypeLabel = data.characterTypes[data.characterType]
      if(chaTypeLabel != undefined) {
        data.characterTypeValues[chaTypeLabel].attributePoints.value = this._calculateAttributePoints(data)
        data.characterTypeValues[chaTypeLabel].qualityPoints.value = this._calculateQualityPoints(data)
        data.characterTypeValues[chaTypeLabel].drawbackPoints.value = this._calculateDrawbackPoints(data)
        data.characterTypeValues[chaTypeLabel].skillPoints.value = this._calculateSkillPoints(data)
        data.characterTypeValues[chaTypeLabel].metaphysicsPoints.value = this._calculateMetaphysicsPoints(data)
      }

      // Set Encumbrance Values
      data.encumbrance.lifting_capacity = this._calculateLiftingCapacity(data)
      data.encumbrance.max = Number((data.encumbrance.lifting_capacity / 2).toFixed(0))
      data.encumbrance.value = this._calculateEncumbrance(data)
      data.encumbrance.level = this._calculateEncumbranceLevel(data)

      // Determine Secondary Attribute Maximum Values
      data.hp.max = this._calcLifePoints(data)
      data.endurance_points.max = this._calcEndurancePoints(data)
      this._calcSpeed(data)
      data.essence.max = this._calcEssencePool(data)

    }

    _prepareCreatureData(actorData) {
      const data = actorData.data

      // Set Encumbrance Values
      data.encumbrance.lifting_capacity = this._calculateLiftingCapacity(data)
      data.encumbrance.max = Number((data.encumbrance.lifting_capacity / 2).toFixed(0))
      data.encumbrance.value = this._calculateEncumbrance(data)
      data.encumbrance.level = this._calculateEncumbranceLevel(data)

      // Determine Secondary Attribute Maximum Values
      data.hp.max = this._calcLifePoints(data)
      data.endurance_points.max = this._calcEndurancePoints(data)
      this._calcSpeed(data)
      data.essence.max = this._calcEssencePool(data)

      // Calculate Power Total
      data.power = this._calculatePowerTotal(data)

    }

    _prepareVehicleData(actorData) {

    }

    _calcLifePoints(data) {
      // Calculate bonuses from all items
      let itemsWithBonus = this.items.filter(item => item.data.data.hasOwnProperty('resource_bonus'))
      let itemBonus = 0
      for (let item of itemsWithBonus) {
        itemBonus = itemBonus + item.data.data.resource_bonus.hp
      }

      // Set return values depending on attribute values
      switch (data.constitution.value > 0 && data.strength.value > 0) {
        case true:
          return (4 * (data.constitution.value + data.strength.value)) + 10 + itemBonus

        case false:
          let strengthVal = data.strength.value <= 0 ? 1 : data.strength.value
          let constitutionVal = data.constitution.value <= 0 ? 1 : data.constitution.value
          return (4 * (strengthVal + constitutionVal)) + 10 + (data.constitution.value < 0 ? data.constitution.value : 0) + (data.strength.value < 0 ? data.strength.value : 0) + itemBonus
      }
    }

    _calcEndurancePoints(data) {
      // Calculate bonuses from all items
      let itemsWithBonus = this.items.filter(item => item.data.data.hasOwnProperty('resource_bonus'))
      let itemBonus = 0
      for (let item of itemsWithBonus) {
        itemBonus = itemBonus + item.data.data.resource_bonus.endurance_points
      }

      return (3 * (data.constitution.value + data.strength.value + data.willpower.value)) + 5 + itemBonus
    }

    _calcSpeed(data) {
      // Calculate bonuses from all items
      let itemsWithBonus = this.items.filter(item => item.data.data.hasOwnProperty('resource_bonus'))
      let itemBonus = 0
      for (let item of itemsWithBonus) {
        itemBonus = itemBonus + item.data.data.resource_bonus.speed
      }

      data.speed.value = 2 * (data.constitution.value + data.dexterity.value) + itemBonus - data.encumbrance.level
      data.speed.halfValue = (data.speed.value / 2).toFixed(0)
    }

    _calcEssencePool(data) {
      // Calculate bonuses from all items
      let itemsWithBonus = this.items.filter(item => item.data.data.hasOwnProperty('resource_bonus'))
      let itemBonus = 0
      for (let item of itemsWithBonus) {
        itemBonus = itemBonus + item.data.data.resource_bonus.essence
      }

      return data.strength.value + data.dexterity.value + data.constitution.value + data.intelligence.value + data.perception.value + data.willpower.value + itemBonus
    }

    _calculateQualityPoints(data) {
      let total = 0
      for (let quality of this.items.filter(item => item.type === 'quality')) {
        total = total + quality.data.data.cost
      }
      return total
    }

    _calculateDrawbackPoints(data) {
      let total = 0
      for (let drawback of this.items.filter(item => item.type === 'drawback')) {
        total = total + drawback.data.data.cost
      }
      return total
    }

    _calculateSkillPoints(data) {
      let total = 0
      for (let skill of this.items.filter(item => item.type === 'skill')) {
        total = total + skill.data.data.level
      }
      return total
    }

    _calculateMetaphysicsPoints(data) {
      let total = 0
      for (let power of this.items.filter(item => item.type === 'power')) {
        total = total + power.data.data.level
      }
      return total
    }

    _calculateAttributePoints(data) {
      let attributeArray = [data.strength.value, data.dexterity.value, data.constitution.value, data.intelligence.value, data.perception.value, data.willpower.value]
      let superTotal = 0

      // Return adjusted total for values over 5
      if (attributeArray.some(attribute => attribute > 5)) {
        for (let attr of attributeArray) {
          let diff = attr - 5
          let multiplier = 3

          if (attr > 5) {superTotal = superTotal + (attr - diff) + (diff * multiplier)}
          else if (attr <= 5) {superTotal = superTotal + attr} 
        }
        return superTotal
      }
      // Return Normal sum total if no value is above 5
      else {return attributeArray.reduce((a, b) => a + b)}
    }

    _calculateLiftingCapacity(data) {
      if (data.strength.value <= 5) {return 50 * data.strength.value}
      else if (data.strength.value <= 10 && data.strength.value >= 6) {return (200 * (data.strength.value - 1) + 250)}
      else if (data.strength.value <= 15 && data.strength.value >= 11) {return (500 *(data.strength.value - 10) + 1250)}
      else if (data.strength.value <= 20 && data.strength.value >= 16) {return (1000 * (data.strength.value - 15) + 5000)}
    }

    _calculateEncumbrance(data) {
      let total = 0
      for (let item of this.items.filter(i => i.data.data.hasOwnProperty('encumbrance'))) {
        let qty = item.data.data.qty != undefined ? item.data.data.qty : 1
        total = total + (item.data.data.encumbrance * qty)
      }

      return total.toFixed(1)
    }

    _calculateEncumbranceLevel(data) {
      if (data.encumbrance.value >= data.encumbrance.max * 1.51) {return 3}
      else if (data.encumbrance.value >= data.encumbrance.max * 1.26) {return 2}
      else if (data.encumbrance.value >= data.encumbrance.max) {return 1}
      else {return 0}
    }

    _calculatePowerTotal(data) {
      let total = 0
      for (let aspect of this.items.filter(item => item.type === 'aspect')) {
        total = total + aspect.data.data.power
      }

      return total
    }

}