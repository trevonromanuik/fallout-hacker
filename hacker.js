var async = require('./async.min');

process.stdin.setEncoding('utf8');

var promptcb = null;
process.stdin.on('readable', function() {
  	var text = process.stdin.read();
  	if (text != null && promptcb) {
  		promptcb(null, trim(text));
  	}
});

function print(text) {
	console.log(text);
}

function prompt(cb) {
	promptcb = function(err, text) {
		promptcb = null;
		cb(err, text);
	}
}

function constructMatrix(options) {

	var matrix = [];
	for (var i = 0; i < options.length; i++) {
		matrix[i] = [];
		for (var j = 0; j < options.length; j++) {
			matrix[i][j] = (i == j) ? 0 : intersect(options[i], options[j]);
		}
	}
	return matrix;

}

function intersect(a, b) {
	var score = 0;
	for (var i = 0; i < a.length; i++) {
		if (a[i] == b[i]) score++;
	}
	return score;
}

function sum(array) {
	var sum = 0;
	for (var i = 0; i < array.length; i++) {
		sum += array[i];
	}
	return sum;
}

function trim(str) {
	return str.substr(0, str.length - 1);
}

async.waterfall([
	function(cb) {
		print('Please enter all options separated by spaces');
		prompt(cb);
	},
	function(text, cb) {
		options = text.split(' ');
		async.whilst(
			function() { return options.length; },
			function(cb) {
				var matrix = constructMatrix(options);
				async.waterfall([
					function(cb) {
						var scores = [];
						for (var i = 0; i < matrix.length; i++) {
							scores[i] = sum(matrix[i]);
							console.log(options[i] + ' - ' + scores[i]);
						}
						var max = Math.max.apply(this, scores);
						for (var i = 0; i < scores.length; i++) {
							if (scores[i] == max) break;
						}
						print('Options are: ' + options.join(' '));
						print('Best guess: ' + options[i] + ' - ' + scores[i]);
						print('Enter your choice');
						prompt(cb);
					},
					function(choice, cb) {
						print('Enter the number of matching characters');
						prompt(function(err, matching) {
							cb(err, choice, matching);
						});
					}
				], function(err, choice, matching) {
					for (var i = 0; i < options.length; i++) {
						if (options[i] == choice) break;
					}
					matching = parseInt(matching);
					for (var j = options.length - 1; j >= 0; j--) {
						if (i == j || matrix[i][j] != matching) options.splice(j, 1);
					}
					cb();
				});
			},
			function(err) {
				print('Thanks for playing!');
				process.exit();
			}
		)
	}
]);