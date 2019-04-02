var likelihood_matrix = [];

window.onload = function() {
	var field = document.getElementById("field");

	var unit = 50;
	var firstClick = true;
	var xOffSet = field.getBoundingClientRect().left;
	var yOffSet = field.getBoundingClientRect().top;
	var xCells = field.getBoundingClientRect().width / unit;
	var yCells = field.getBoundingClientRect().height / unit;
	var timer, seconds = 0;

	var mines_matrix = [];
	var mines = Math.floor((xCells * yCells) * 0.15);

	var min_likelihood = mines / (xCells * yCells);

	for(var i = 0; i < xCells; i++) {
		mines_matrix[i] = [];
		likelihood_matrix[i] = [];
		for(var j = 0; j < yCells; j++) {
			mines_matrix[i][j] = 0;
			likelihood_matrix[i][j] = 999;

			var cell = document.createElement("input");
			cell.type = "button";
			cell.name = "mine_cell";
			cell.style.position = "fixed";
			cell.style.left = Math.floor(i * unit + xOffSet) + "px";
			cell.style.top = Math.floor(j * unit + yOffSet) + "px";
			cell.setAttribute("x", i);
			cell.setAttribute("y", j);
			cell.id = i + ":" + j;
			cell.style.height = "50px";
			cell.style.width = "50px";
			cell.className = "cell";
			cell.oncontextmenu = function() {
				this.readOnly = !this.readOnly;
				if(document.querySelectorAll(".cell[readonly]").length === mines) {
					if((document.querySelectorAll(".cell[disabled]").length + document.querySelectorAll(".cell[readonly]").length) === (xCells * yCells)) {
						end_game("w");
					}
				}
			}
			cell.onclick = function() {
				if(!this.readOnly) {
					click_action(this);
					var game_ended = false;
					if(this.getAttribute("cell_value") == "-1") {
						end_game("l");
						game_ended = true;
					} else {
						this.value = this.getAttribute("cell_value");
					}
					this.disabled = true;
					if(!game_ended && (((xCells * yCells) - document.querySelectorAll('.cell[disabled]').length) === mines)) {
						end_game("w");
					}
				}
			}

			field.appendChild(cell);
		}
	}

	function end_game(type) {
		var mine_cells = document.getElementsByName("mine_cell");
		for(var i = 0; i < xCells; i++) {
			for(var j = 0; j < yCells; j++) {
				mine_cells[i * xCells + j].onclick = function() {};
				if(mines_matrix[i][j] == -1) {
					if(type === "l") {
						if(mine_cells[i * xCells + j].readOnly) {
							mine_cells[i * xCells + j].style.backgroundColor = "#0a0";
						} else {
							mine_cells[i * xCells + j].style.backgroundColor = "#900";
						}
					} else if(type === "w") {
						mine_cells[i * xCells + j].style.backgroundColor = "#0a0";
					}
				}
			}
		}
		clearInterval(timer);
		clearInterval(ai_clicker);
	}

	function click_action(clicked_cell) {
		if(firstClick) {
			firstClick = false;
			generate_mines(clicked_cell.getAttribute("x"), clicked_cell.getAttribute("y"));
		} else {
			if(clicked_cell.getAttribute("cell_value") === "0") {
				var cellX = Number.parseInt(clicked_cell.getAttribute("x"));
				var cellY = Number.parseInt(clicked_cell.getAttribute("y"));
				var nbr_pos = [
					{
						x: cellX - 1,
						y: cellY
					},
					{
						x: cellX,
						y: cellY - 1
					},
					{
						x: cellX + 1,
						y: cellY
					},
					{
						x: cellX,
						y: cellY + 1
					},
					{
						x: cellX - 1,
						y: cellY - 1
					},
					{
						x: cellX - 1,
						y: cellY + 1
					},
					{
						x: cellX + 1,
						y: cellY - 1
					},
					{
						x: cellX + 1,
						y: cellY + 1
					}
				];
				for(var i in nbr_pos) {
					if(nbr_pos[i].x >= 0 && nbr_pos[i].y >= 0 && nbr_pos[i].x < xCells && nbr_pos[i].y < yCells && !document.getElementById(nbr_pos[i].x + ":" + nbr_pos[i].y).disabled) {
						var nbr_cell = document.getElementById(nbr_pos[i].x + ":" + nbr_pos[i].y);
						if(nbr_cell.getAttribute("cell_value") != "-1") nbr_cell.click();
					}
				}
			}
		}
	}

	function generate_mines(nomine_x, nomine_y) {
		function refresh_mines_matrix() {
			var mine_cells = document.getElementsByName("mine_cell");
			for(var i = 0; i < xCells; i++) {
				for(var j = 0; j < yCells; j++) {
					if(mines_matrix[i][j] != -1) {
						var mine_count = 0;
						if((i - 1) >= 0 && mines_matrix[i - 1][j] === -1) mine_count++;
						if((j - 1) >= 0 && mines_matrix[i][j - 1] === -1) mine_count++;
						if((i + 1) < xCells && mines_matrix[i + 1][j] === -1) mine_count++;
						if((j + 1) < yCells && mines_matrix[i][j + 1] === -1) mine_count++;
						if((i - 1) >= 0 && (j - 1) >= 0 && mines_matrix[i - 1][j - 1] === -1) mine_count++;
						if((i - 1) >= 0 && (j + 1) < yCells && mines_matrix[i - 1][j + 1] === -1) mine_count++;
						if((i + 1) < xCells && (j - 1) >= 0 && mines_matrix[i + 1][j - 1] === -1) mine_count++;
						if((i + 1) < xCells && (j + 1) < yCells && mines_matrix[i + 1][j + 1] === -1) mine_count++;

						mines_matrix[i][j] = mine_count;
						mine_cells[i * xCells + j].setAttribute("cell_value", mine_count);
					} else {
						mine_cells[i * xCells + j].setAttribute("cell_value", -1);
					}
					if(i === xCells - 1 && j === yCells - 1 && document.getElementById(nomine_x + ":" + nomine_y).getAttribute("cell_value") === "0") {
						document.getElementById(nomine_x + ":" + nomine_y).click();
					}
				}
			}
		}

		for(var i = 0; i < mines; i++) {
			var temp_mine_pos = {
				x: Math.floor(Math.random() * xCells),
				y: Math.floor(Math.random() * yCells)
			};

			if((temp_mine_pos.x == Number.parseInt(nomine_x) && temp_mine_pos.y == Number.parseInt(nomine_y)) || (mines_matrix[temp_mine_pos.x][temp_mine_pos.y] === -1)) {
				i--;
			} else {
				mines_matrix[temp_mine_pos.x][temp_mine_pos.y] = -1;
			}

			if(i === mines - 1) refresh_mines_matrix();
		}

		timer = setInterval(function() {
			seconds++;
			document.getElementById("timer").value = seconds;
		}, 1000);
	}

	function reset_likelihood_matrix() {
		for(var i = 0; i < xCells; i++) {
			likelihood_matrix[i] = [];
			for(var j = 0; j < yCells; j++) {
				likelihood_matrix[i][j] = 999;
				if((i === (xCells - 1)) && (j === (yCells - 1))) {
					calc_likelihood();
				}
			}
		}
	}

	function calc_likelihood() {
		var all_disabled_cells = document.querySelectorAll(".cell[disabled]");
		var counter = 0;
		var clicked_once = false;
		var max_len = all_disabled_cells.length;
		if(max_len > 0) {
			all_disabled_cells.forEach(function(cell) {
				counter++;
				var cellX = Number.parseInt(cell.getAttribute("x"));
				var cellY = Number.parseInt(cell.getAttribute("y"));
				var nbr_pos = [
					{
						x: cellX - 1,
						y: cellY
					},
					{
						x: cellX,
						y: cellY - 1
					},
					{
						x: cellX + 1,
						y: cellY
					},
					{
						x: cellX,
						y: cellY + 1
					},
					{
						x: cellX - 1,
						y: cellY - 1
					},
					{
						x: cellX - 1,
						y: cellY + 1
					},
					{
						x: cellX + 1,
						y: cellY - 1
					},
					{
						x: cellX + 1,
						y: cellY + 1
					}
				];
				var unchecked_cells = 0;
				var nbr_mines = 0;
				for(var i in nbr_pos) {
					if(nbr_pos[i].x >= 0 && nbr_pos[i].y >= 0 && nbr_pos[i].x < xCells && nbr_pos[i].y < yCells) {
						var nbr_cell = document.getElementById(nbr_pos[i].x + ":" + nbr_pos[i].y);
						if(!nbr_cell.disabled && !nbr_cell.readOnly) {
							unchecked_cells++;
						}
						if(nbr_cell.readOnly) {
							nbr_mines++;
						}
					}
					if(i === "7" && unchecked_cells > 0) {
						var nbr_likelihood = (Number.parseInt(cell.getAttribute("cell_value")) - nbr_mines) / unchecked_cells;

						for(var j in nbr_pos) {
							if(nbr_pos[j].x >= 0 && nbr_pos[j].y >= 0 && nbr_pos[j].x < xCells && nbr_pos[j].y < yCells) {
								var nbr_cell = document.getElementById(nbr_pos[j].x + ":" + nbr_pos[j].y);
								if(!nbr_cell.disabled && !nbr_cell.readOnly) {
									if(nbr_likelihood === 1) {
										console.log("definite");
										clicked_once = true;
										nbr_cell.readOnly = true;
									}
									var lm_nbr = likelihood_matrix[nbr_pos[j].x][nbr_pos[j].y];
									if(nbr_likelihood <= 0) {
										likelihood_matrix[nbr_pos[j].x][nbr_pos[j].y] = 0;
									} else if (lm_nbr != 0) {
										if(lm_nbr === 999) {
											likelihood_matrix[nbr_pos[j].x][nbr_pos[j].y] = nbr_likelihood;
										} else {
											likelihood_matrix[nbr_pos[j].x][nbr_pos[j].y] += nbr_likelihood;
										}
									}
								}
							}
						}
					}
				}
				if((counter == max_len) && !clicked_once) {
					click_cell();
				}
			});
		}
	}

	function click_cell() {
		var min_likelihood_pos = {
			x: "0",
			y: "0",
			likelihood: 999
		};
		for(var i = 0; i < likelihood_matrix.length; i++) {
			for(var j = 0; j < likelihood_matrix[i].length; j++) {
				if(likelihood_matrix[i][j] < min_likelihood_pos.likelihood) {
					min_likelihood_pos = {
						x: i,
						y: j,
						likelihood: likelihood_matrix[i][j]
					};
				}
				if((i === (likelihood_matrix.length - 1)) && (j === (likelihood_matrix[i].length - 1))) {
					console.log(min_likelihood_pos);
					console.log(document.getElementById(min_likelihood_pos.x + ":" + min_likelihood_pos.y));
					document.getElementById(min_likelihood_pos.x + ":" + min_likelihood_pos.y).click();
				}
			}
		}
	}

	var ai_clicker = setInterval(reset_likelihood_matrix, 50);

	document.getElementById(Math.floor(Math.random() * xCells) + ":" + Math.floor(Math.random() * yCells)).click();
}
