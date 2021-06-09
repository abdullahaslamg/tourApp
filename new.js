class ApiFeatuers {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  info() {
    const myName = this.name;
    myAge = this.age;
    return this;
  }
}

const newInstance = new ApiFeatuers('Abdullah', 24);
newInstance.info();
