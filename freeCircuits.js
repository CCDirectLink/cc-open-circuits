
/*
* Code by EpicYoshiMaster
*
* Handles functionality of Free Circuits
*/

ig.module('yoshi-open-circuits-free') 
	.defines(() => {

		//I didn't really want to resort to global level variables
		//but the circuit menu seems to be really annoying to access from outside
		let useFreeCircuits = false;

		sc.CircuitMenu.inject({
			hotkeyFree: null,

			init(...args) {
				this.hotkeyFree = new sc.ButtonGui("\\i[help3]" + ig.lang.get("sc.gui.menu.hotkeys.free-circuits"), void 0, true, sc.BUTTON_TYPE.SMALL);
				this.hotkeyFree.startHidden = true;
				this.hotkeyFree.doStateTransition("HIDDEN");
				this.hotkeyFree.setActive(false);
				this.hotkeyFree.keepMouseFocus = true;
				this.hotkeyFree.hook.transitions = {
					DEFAULT: {
						state: {},
						time: 0.2,
						timeFunction: KEY_SPLINES.EASE
					},
					HIDDEN: {
						state: {
							offsetY: -this.hotkeyFree.hook.size.y
						},
						time: 0.2,
						timeFunction: KEY_SPLINES.LINEAR
					}
				};
				this.hotkeyFree.onButtonPress = this._onFreeButtonPressed.bind(this);

				useFreeCircuits = false;

				this.parent(...args);
			},

			_onFreeButtonPressed: function() {

				if(!useFreeCircuits) {
					useFreeCircuits = true;
					this.hotkeyFree.setText("\\i[help3]" + ig.lang.get("sc.gui.menu.hotkeys.paid-circuits"));
				}
				else {
					useFreeCircuits = false;
					this.hotkeyFree.setText("\\i[help3]" + ig.lang.get("sc.gui.menu.hotkeys.free-circuits"));
				}
			},

			exitMenu() {
				sc.menu.buttonInteract.removeGlobalButton(this.hotkeyFree);
				this.parent();
			},

			_onhotkeyFreeCheck: function() {
				return sc.control.menuHotkeyHelp3();
			},

			_addHotKeys(b) {
				sc.menu.buttonInteract.addGlobalButton(this.hotkeyFree, this._onhotkeyFreeCheck.bind(this));
				this.parent(b);
			},

			commitHotKeysToTopBar(b) {
				sc.menu.addHotkey(function() {
					return this.hotkeyFree
				}.bind(this));

				this.parent(b);
			},

			modelChanged: function(b, a) {
				this.parent(b, a);

				if(b == sc.menu && a == sc.MENU_EVENT.SKILL_TREE_SELECT) {
					if(sc.menu.currentSkillTree < 0) {
						this.hotkeyFree.startHidden = true;
						this.hotkeyFree.doStateTransition("HIDDEN");
						this.hotkeyFree.setActive(false);
					}
					else {
						this.hotkeyFree.startHidden = false;
						this.hotkeyFree.setActive(true);
						this.hotkeyFree.doStateTransition("DEFAULT");
					}
				}
			}

		});

		//Free up getting past blocked nodes
		sc.CircuitTreeDetail.Node.inject({

			_checkParentForBlock(a) {
				if(useFreeCircuits) {
					return false;
				}
				else {
					return this.parent(a);
				}
			}
		});

		//Wanted a way to make sure this isn't a hard override
		//This stores the old one to make sure it still goes through correctly
		sc.OldSkillTools = sc.SkillTools;

		sc.SkillTools = {
			getCPCost: function(a, b) {
				if(useFreeCircuits) {
					return 0;
				}
				else {
					return sc.OldSkillTools.getCPCost(a, b);
				}
			}
		}

	});