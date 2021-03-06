const angular = require('angular');
const moment = require('moment')

module.exports = Controller;

Controller.$inject = ['$scope', '$cookies', '$injector', 'promiseTracker'];

function Controller($scope, $cookies, $injector, promiseTracker) {
  let vm = {};

  let newMessageDestroyFunc;

  this.$onInit = function() {
    vm = this;

    vm.isRecipient = _isRecipient;
    vm.onKeyPress = _onKeyPress;
    vm.sendMessageCtrl = _sendMessage;
    vm.messagesList = [];
    vm.message = '';
    vm.loggedUser = _getUserInfo().id;
    vm.MessageChatAppService = $injector.get('MessageChatAppService');
    vm.WebsocketService = $injector.get('WebsocketService');

    vm.tracker = {
      loadingMessages: promiseTracker()
    };

    newMessageDestroyFunc = $scope.$on('newMessage', _onNewMessage);
    $scope.$watch('vm.contact.id', _onRecipientUserChanges, true);

    _loadAllMessages(vm.contact.id);
  };

  this.$onDestroy = function() {
    newMessageDestroyFunc();
  };

  function _isRecipient(message) {
    return message.userRecipient.id === vm.loggedUser;
  }

  function _onRecipientUserChanges(newValue, oldValue) {
    if (oldValue !== newValue) _loadAllMessages(newValue);
  }

  function _onKeyPress($event) {
    if (vm.message && $event.keyCode == 13) _sendMessage();
  }

  function _onNewMessage(event, data) {
    if (data.contact.id === vm.contact.id) _pushNewMessage(data);
  }

  function _sendMessage() {
    let message = angular.copy(vm.message);
    vm.message = '';
    let payload = {
      userSender:  _getUserInfo(),
      message: message,
      userRecipient: vm.contact.user,
      contact: vm.contact
    };
    vm.WebsocketService.sendMessage(payload);

    let payloadToBePushed = angular.copy(payload);
    payloadToBePushed.createdIn = moment().format('HH:mm DD/MM/YYYY');
    _pushNewMessage(payloadToBePushed, true);
  }

  function _pushNewMessage(data, onSend = false) {
    vm.messagesList.push(data);
    if (!onSend) $scope.$apply(vm.messagesList);
  }

  function _getUserInfo() {
    return angular.fromJson($cookies.get('userCredentials'));
  }

  function _loadAllMessages(id) {
    vm.tracker.loadingMessages.addPromise(
      vm.MessageChatAppService.loadAllMessages(id).then(response => {
        vm.messagesList = response;
      })
    );
  }
}
