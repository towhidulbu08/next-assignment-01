const filterEvenNumbers = (n: number[]): number[] => {
  return n.filter((e) => e % 2 === 0);
};

const reverseString = (str: string): string => {
  const strArray = str.split("");

  return strArray.reverse().join("");
};

type StringOrNumber = string | number;
const checkType = (input: StringOrNumber) => {
  if (typeof input === "string") return "String";
  return "Number";
};

const getProperty = <T, K extends keyof T>(obj: T, key: K): T[K] => {
  return obj[key];
};
const user = { id: 1, name: "John Doe", age: 21 };

interface Book {
  title: string;
  author: string;
  publishedYear: number;
}

interface BookWithRead extends Book {
  isRead: boolean;
}

const toggleReadStatus = (obj: Book): BookWithRead => {
  return { ...obj, isRead: true };
};
const myBook = {
  title: "TypeScript Guide",
  author: "Jane Doe",
  publishedYear: 2024,
};

class Person {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

class Student extends Person {
  grade: string;
  constructor(name: string, age: number, grade: string) {
    super(name, age);
    this.grade = grade;
  }
  getDetails() {
    return `"Name: ${this.name}, Age: ${this.age}, Grade: ${this.grade};`;
  }
}

const student = new Student("ALice", 20, "A");

const getIntersection = (a: number[], b: number[]): number[] => {
  return a.filter((ele) => b.includes(ele));
};
