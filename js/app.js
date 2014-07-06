
//CONTORLLERS
var raffleAppControllers = angular.module('raffleAppControllers', []);

raffleAppControllers.controller('registrationCtrl', ['$scope', 'registrationSvc', function($scope,registrationSvc) {

	$scope.members = [];
	$scope.events = [];
	
	registrationSvc.getMembers().then(function(members) { $scope.members = members;  });
	registrationSvc.getEvents().then(function(events) {  $scope.events = events;  });

	$scope.currentEvent = { id: 0 };
	$scope.memberInputDisplay = 1;
	$scope.eventInputDisplay = 1;


	$scope.showAttendeeList = function() { return $scope.currentEvent.id != 0; };

	$scope.createEvent = function(newEvent) {
		registrationSvc.addEvent(newEvent).then(function(events) {
			$scope.events = events;
			$scope.currentEvent = newEvent;
			$scope.newEvent = {};
		});
		
	}

	$scope.selectEvent = function(event) {
		$scope.currentEvent = event;
	}

	$scope.addAttendee = function(attendee) {
		addAttendeeToEvent(attendee);
	}

	$scope.createAttendee = function(newAttendee) {
		addAttendeeToEvent(newAttendee);

		registrationSvc.createMember(newAttendee).then(function(members) {
			$scope.members = members;
			$scope.newAttendee = {};
		});
		
	}

	$scope.adjustEntries = function(attendee, value) {
		if(isNaN(attendee.entries)) { attendee.entries = 2; }
		attendee.entries += value;

		if(attendee.entries < 0) { attendee.entries = 0; }

	}

	$scope.removeAttendee = function(attendee) {
		var position = $scope.currentEvent.attendees.indexOf(attendee);

		if ( ~position ) $scope.currentEvent.attendees.splice(position, 1);
	}

	function addAttendeeToEvent(attendee) {
		if($scope.currentEvent.attendees == undefined) { $scope.currentEvent.attendees = []; }
		attendee.entries = 2;
		$scope.currentEvent.attendees.push(attendee);
	}

	$scope.isAttending = function(attendees) {
		return function(member) {
			
			if(attendees == undefined) { return true; }

			for(var i =0;i<attendees.length;i++) {
				if(attendees[i].email == member.email) {
					return false;
				}
			}

			return true;
		}
	}

}]);

raffleAppControllers.controller('raffleCtrl', ['$scope', 'registrationSvc', function($scope,registrationSvc) {
	var emptyWinner = {};

	registrationSvc.getEvents().then(function(events) { $scope.events = events; });

	$scope.currentEvent = { id: 0 };
	$scope.memberInputDisplay = 1;
	$scope.eventInputDisplay = false;
	$scope.currentWinner = emptyWinner;
	$scope.hasError = true;
	$scope.errorMessage = 'No entries for this raffle';

	raffleEntries = [];

	createEntries = function() {
		if($scope.currentEvent.raffleStarted === true) { return; }

		var attendees = $scope.currentEvent.attendees;

		for(var i = 0; i < attendees.length; i++) {

			for(var x = 0; x < attendees[i].entries; x++) {
				raffleEntries.push(attendees[i]);
			}
		}

	}

	$scope.showRaffle = function() { return $scope.currentEvent.id != 0 && $scope.hasError == false; };

	$scope.selectEvent = function(event) {
		$scope.currentEvent = event;
		createEntries();
		$scope.eventInputDisplay = !$scope.eventInputDisplay;

		
		validateEvent();
	}

	$scope.drawWinner = function() {
		validateEvent();
			$scope.currentEvent.raffleStarted = true;
			$scope.currentEvent.raffleCompleted = false;

		var rand = raffleEntries[Math.floor(Math.random() * raffleEntries.length)];
		var winner = {};
		angular.copy(rand, winner);

		$scope.currentWinner = winner;
		$scope.currentEvent.winners.push(winner);

		var position = raffleEntries.indexOf(rand);
		if ( ~position ) raffleEntries.splice(position, 1);


	}

	$scope.setPrize = function(prize) {
		var winner = {};

		angular.copy($scope.currentWinner, winner);
		prize.winner  = winner;

		$scope.currentWinner = emptyWinner;


	}

	$scope.canDraw = function() {
		
		if($scope.currentEvent.raffleCompleted) { return false; }
		if($scope.currentWinner != emptyWinner) { return false; }
		return !$scope.hasError;

	}

	validateEvent = function() {
		if(raffleEntries == undefined || (raffleEntries.length == 0 && ($scope.currentEvent.winners == undefined || $scope.currentEvent.winners.length == 0))) {
			setError('No entries for this raffle');
			return;
		}

		if(raffleEntries.length == 0 &&  $scope.currentEvent.winners.length > 0) {
			$currentEvent.raffleCompleted = true;
			setError('No more entries for this raffle!');
			return;
		}

		if($scope.currentEvent.prizes.length == 0) {
			setError('No more prizes left!');
			return;
		}

		clearError();

	}

	setError = function(message) {
		$scope.hasError = true;
		$scope.errorMessage = message;
	}

	clearError = function() {
		$scope.errorMessage = '';
		$scope.hasError = false;
	}

	$scope.hasWinner = function(result) {
		return function(prize ) {

			if(prize == undefined) { return false; }

			if(result) {
				return prize.winner != undefined;
			} else {
				return prize.winner == undefined;
			}
		}
	}

}]);

raffleAppControllers.controller('setupCtrl', function($scope) {

	

});

raffleAppControllers.controller('reportsCtrl', function($scope) {

	

})

//SERVICES
var raffleAppServices = angular.module('raffleAppServices', []);

raffleAppServices.factory('registrationSvc', 
		function($q,$timeout) {
			return 	{
					__events: [ 
								{ id: 1, date: '5/6/2014', speaker: 'Daniel Lewis', topic: 'Node.JS', location: 'San Bernardino', attendees: [], winners:[],
									prizes: [{ name: 'Telerik Ultimate', sponsor:'Telerik' },{ name: '1 Month Subscription', sponsor:'Pluralsight' }]
								 },
								{ id: 2, date: '6/10/2014', speaker: 'Dustin Davis', topic: 'SPA with Angular.JS', location: 'San Bernardino', attendees: [], winners:[],
									prizes: [{ name: 'Telerik Ultimate', sponsor:'Telerik' },{ name: '1 Month Subscription', sponsor:'Pluralsight' }]
								 },
								{ id: 3, date: '7/10/2014', speaker: 'Mike Roth', topic: 'Stuff', location: 'San Bernardino', attendees: [], winners:[],
									prizes: [{ name: 'Telerik Ultimate', sponsor:'Telerik' },{ name: '1 Month Subscription', sponsor:'Pluralsight' }]
								 }
							],
					__members: [
						{ id: 1, firstName: 'Dustin', lastName:'Davis', email:'dd@dd.com'},
						{ id: 2, firstName: 'John', lastName:'Smith', email:'js@dd.com'},
						{ id: 3, firstName: 'Mary', lastName:'Smith', email:'ms@dd.com'}
					],

					getEvents: function() {
						var deferred = $q.defer();	
						var self = this;

						setTimeout(function() {
							deferred.resolve(self.__events);
						}, 500);

						return	deferred.promise;
					},
					addEvent: function(newEvent) {
						var deferred = $q.defer();	
						var self = this;
						
						setTimeout(function() {
							self.__events.push(newEvent);
							deferred.resolve(self.__events);
						}, 500);

						return	deferred.promise;

					},
					getMembers: function() {
						var deferred = $q.defer();	
						var self = this;

						setTimeout(function() {
							deferred.resolve(self.__members);
						}, 500);

						return	deferred.promise;
					},
					createMember: function(member) {
						var deferred = $q.defer();	
						var self = this;

						setTimeout(function() {
							self.__members.push(member);
							deferred.resolve(self.__members);
						}, 500);

						return	deferred.promise;
						
					}

				};
		}

	);



var raffleApp = angular.module('ugRaffleApp', ['ngRoute', 'raffleAppControllers','raffleAppServices']);

//FILTERS


//ROUTING

raffleApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('/registration', { templateUrl: 'apps/registration/index.html', controller: 'registrationCtrl'})
			.when('/raffle', { templateUrl: 'apps/raffle/index.html', controller: 'raffleCtrl'})
			.when('/setup', { templateUrl: 'apps/setup/index.html', controller: 'setupCtrl'})
			.when('/reports', { templateUrl: 'apps/reports/index.html', controller: 'reportsCtrl'})
			.otherwise({redirectTo:'/registration'});

	}]

);





