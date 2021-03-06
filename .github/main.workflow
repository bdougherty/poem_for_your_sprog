workflow "Install and Test" {
  on = "push"
  resolves = ["Test"]
}

action "Install" {
  uses = "actions/npm@6309cd9"
  args = "install"
}

action "Test" {
  uses = "actions/npm@6309cd9"
  args = "test"
  needs = ["Install"]
}
