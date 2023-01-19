/*
* Code by EpicYoshiMaster
*
* Handles the Refund Button and all Refund functionality
*/

ig.module('yoshi-open-circuits-refund') 
	.defines(() => {

		sc.CircuitNodeMenu.inject({
			refund: null,

			//Injects the Refund button and proper line placement to account for this new button
			init(...args) {
				this.parent(...args);

				//Add our new button in

				this.refund = new sc.ButtonGui(ig.lang.get("sc.gui.menu.skill.refund"), 96, true, sc.BUTTON_TYPE.ITEM);
				this.refund.setPos(1, 61);
				this.refund.submitSound = null;
				this.refund.onButtonPress = this._onRefundPress.bind(this);
				this.addChildGui(this.refund);
				this.buttonGroup.addFocusGui(this.refund, 0, 2);

				//Adjust the menu to handle this new button
				this.setSize(100, 83); //Size of the black border

				//Change the gray lines around the buttons
				for(let i = 0; i < this.hook.children.length; i++) {

					if(this.hook.children[i].gui instanceof ig.ColorGui) {
						let colorGui = this.hook.children[i].gui;

						//Lower Horizontal line, push this down another 20
						if(colorGui.hook.pos.x == 1 && colorGui.hook.pos.y == 61) {
							colorGui.setPos(colorGui.hook.pos.x, (colorGui.hook.pos.y) + 20);
						}
						//Lower Vertical line, stretch this down another 20
						else if(colorGui.hook.pos.x == 98 && colorGui.hook.pos.y == 36) {
							colorGui.setSize(colorGui.hook.size.x, colorGui.hook.size.y + 20);
						}
					}
				}

			},

			//Controls the display of the Refund button
			_setContent(a) {
				this.parent(a);

				let currentSkill = this._currentFocusGui.skill,
					currentSkillId = currentSkill.uid;

				//Ok lets start by defaulting everything and go from there
				this.refund.textChild.setText(ig.lang.get("sc.gui.menu.skill.refund"));
				this.refund.setActive(true);

				if (sc.model.player.hasSkill(currentSkillId)) {

					if(this._HasChildSkill(this._currentFocusGui)) {
						//console.log('[Open-Circuits] Player owns Child Skill!');
						this.refund.textChild.setText(ig.lang.get("sc.gui.menu.skill.refund-all"));
					}
					else {
						//console.log('[Open-Circuits] Player does not own Child Skill.');
					}
				} 
				//We don't have this skill, we need to check a bit more information
				else {
					this.refund.setActive(false);
				}
			},

			//Determines if the player has a child skill of a given skill
			_HasChildSkill: function(currentSkillGui) {

				//console.log(`[Open-Circuits] TESTING Skill ID: ${currentSkillGui.skill.uid} for Child Skills`);

				let player = sc.model.player;
				let currentSkill = currentSkillGui.skill;
				let currUid = currentSkill.uid;

				let isBranchSkill = currentSkillGui.branchSkill ? true : false;

				if(isBranchSkill) {
					//console.log(`[Open-Circuits] Branch Skill Detected orBranchIndex: ${currentSkillGui.orBranchIndex}`);

					let nextSkillUid;

					if(currentSkillGui.orBranchIndex < 2) {
						//Next branch skill is just the current one + 2
						nextSkillUid = currUid + 2;
					}
					else {
						//The skill after the final branch is either + 1 or + 2 depending on which side
						nextSkillUid = currUid + (currentSkillGui.orLeft ? 2 : 1);

						//EXCEPT in the double branch case, where we need to check one more
						//I'M SORRY FOR HARDCODING THIS I WAS TIRED OF DEALING WITH IT
						if(currUid == 95 || currUid == 96 || currUid == 182 || currUid == 183 
						|| currUid == 269 || currUid == 270 || currUid == 356 || currUid == 357) {

							//console.log(`[Open-Circuits] Double Branch Link Skill Detected!`);
							let nextNextSkillUid = nextSkillUid + 1;

							if(player.hasSkill(nextNextSkillUid)) {
								//console.log(`[Open-Circuits] Double Branch Link Skill Owned!`);
								return true;
							}
						}
					}

					let result = player.hasSkill(nextSkillUid);

					//console.log(`[Open-Circuits] Next Skill: ${nextSkillUid}, Has Skill: ${result}`);

					return result;
				}
				
				if(currentSkill.children) {

					//console.log(`[Open-Circuits] Node with Children Detected!`);

					for(let i = 0; i < currentSkill.children.length; i++) {

						if(sc.model.player.hasSkill(currentSkill.children[i].uid)) {
							//console.log(`[Open-Circuits] Child Node is Owned!`);
							return true;
						}
						
						if(currentSkill.children[i].orBranch) {
							//console.log('[Open-Circuits] Child Or Branch detected!');

							if(sc.model.player.hasSkill(currentSkill.children[i].orBranch.left[0].uid)) {
								//console.log('[Open-Circuits] Owns Left Branch Path');
								return true;
							}
							else if(sc.model.player.hasSkill(currentSkill.children[i].orBranch.right[0].uid)) {
								//console.log('[Open-Circuits] Owns Right Branch Path');
								return true;
							}
						}
					}
				}

				return false;
			},

			//Helper function for _recursiveRefund, encapsulates the owned skill and gui grab checks
			_checkAndRecurseRefund: function(currentSkillGui, newSkillUid) {
				if(sc.model.player.hasSkill(newSkillUid)) {
					let newGui = this._findGuiForUid(currentSkillGui, newSkillUid);

					if(newGui) {
						this._recursiveRefund(newGui);
					}
				}
			},

			//Helper function for _recursiveRefund, locates the gui for a uid by searching in the button group of the current gui
			_findGuiForUid(lastGui, skillUid) {

				if(lastGui._buttonGroup) {

					for(let i = 0; i < lastGui._buttonGroup.elements.length; i++) {
						
						if(lastGui._buttonGroup.elements[i][0].skill && lastGui._buttonGroup.elements[i][0].skill.uid) {
							if(lastGui._buttonGroup.elements[i][0].skill.uid == skillUid) {
								return lastGui._buttonGroup.elements[i][0];
							}
						}
					}
				}

				return null;
			},

			//Recursively refunds this skill and all of its child skills
			_recursiveRefund: function(currentSkillGui) {

				//Find All Owned Child Skills
				let currentSkill = currentSkillGui.skill;
				let currUid = currentSkill.uid;

				let isBranchSkill = currentSkillGui.branchSkill ? true : false;

				if(isBranchSkill) {
					let nextSkillUid;

					if(currentSkillGui.orBranchIndex < 2) {
						//Next branch skill is just the current one + 2
						nextSkillUid = currUid + 2;
					}
					else {
						//The skill after the final branch is either + 1 or + 2 depending on which side
						nextSkillUid = currUid + (currentSkillGui.orLeft ? 2 : 1);

						if(currUid == 95 || currUid == 96 || currUid == 182 || currUid == 183 
						|| currUid == 269 || currUid == 270 || currUid == 356 || currUid == 357) {

							let nextNextSkillUid = nextSkillUid + 1;

							this._checkAndRecurseRefund(currentSkillGui, nextNextSkillUid);
						}
					}

					this._checkAndRecurseRefund(currentSkillGui, nextSkillUid);
				}
				
				if(currentSkill.children) {

					for(let i = 0; i < currentSkill.children.length; i++) {

						if(currentSkill.children[i].uid) {
							this._checkAndRecurseRefund(currentSkillGui, currentSkill.children[i].uid);
						}
						
						if(currentSkill.children[i].orBranch) {

							this._checkAndRecurseRefund(currentSkillGui, currentSkill.children[i].orBranch.left[0].uid);
							this._checkAndRecurseRefund(currentSkillGui, currentSkill.children[i].orBranch.right[0].uid);
						}
					}
				}

				this._refundSkill(currUid);
				sc.menu.showSkillEffect(this._currentFocusGui, false);
				this.activateSound.play();
			},

			//Refunds a skill to the player, returns true if the skill was actually refunded
			_refundSkill: function(skillUid) {
				if(sc.model.player.hasSkill(skillUid)) {
					
					let baseSkill = sc.skilltree.getSkill(skillUid);

					sc.model.player.skillPoints[baseSkill.element] += baseSkill.getCPCost();
					sc.model.player.unlearnSkill(skillUid);
					sc.model.player.updateStats();

					return true;
				}

				return false;
			},

			//Event Response for when the Refund button is pressed
			_onRefundPress: function() {
				
				//Refund this and all child skills
				if(this._currentFocusGui && sc.model.player.hasSkill(this._currentFocusGui.skill.uid)) {
					this._recursiveRefund(this._currentFocusGui);
					sc.menu.exitNodeMenu();
				}
			},
		});
	
	});