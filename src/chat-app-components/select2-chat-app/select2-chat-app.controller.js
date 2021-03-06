const angular = require("angular");

module.exports = Controller;

Controller.$inject = ['SelectService', '$scope'];

function Controller(SelectService, $scope) {
  let vm = null;
  this.$onInit = function() {
    vm = this;
    vm.searchUser = _searchUser;
    vm.onSelectUser = _onSelectUser;
  }

  function _onSelectUser($select) {
    let userSelected = angular.copy(vm.ngModel.selected);
    delete $select.selected;
    $scope.$emit('onSelectUser', userSelected);
  }

  function _searchUser($select) {
    let idsSelected = vm.selectedUsers.map(item => item.user.id).join(',');
    let params = {
      keyWord: $select.search,
      notIn: `${idsSelected}`
    };

    SelectService.searchUser(params).then(response => {
      vm.people = response;
    });
  }
}
