/* tslint:disable */
export class Parent {
  someProp = {
    foo: 'bar',
  };
}

export class Child extends Parent {
  someProp = Object.assign(super.someProp, {
    bar: 'baz'
  });
}
