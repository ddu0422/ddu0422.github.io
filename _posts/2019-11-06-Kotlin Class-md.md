---
layout: single
title: Kotlin 클래스
tag: [Kotlin, Basic]
categories: [Kotlin]
---

## 클래스

- 코틀린에서 클래스를 선언하는 방법은 class 예약어를 이용한다.
- 클래스를 선언할 때 클래스 몸체가 없다면 중괄호는 생략 가능
- 코틀린에서는 kt 파일과 클래스명이 달라도 된다.

```kotlin
// 몸체가 있는 클래스
class MyClass {}

// 몸체가 없는 클래스
class MyClass

// 클래스의 구성요소
class MyClass {
    val myVariable    // 필드
    constructor() { } // 보조 생성자
    fun myFun() { }   // 함수
    class Inner { }   // 내부 클래스
}
```

## 객체 생성

- 클래스의 구성요소를 이용하려면 구성요소가 메모리에 올라와야 하는데 (메모리 할당) 객체를 생성할 때 메모리가 할당
- 객체 생성은 결국 클래스를 이용하기 위해 메모리를 할당하는 작업
- 할당된 메모리를 객체명으로 참조해서 이용하는 개념

```kotlin
class MyClass {
    var name: String = "world"
    
    fun sayHello() {
        println("hello ${name}")
    }
}

fun main(args: Array<String>) {
    val obj1 = MyClass()
    val obj2 = MyClass()

    obj1.name = "mir"
    obj2.name = "lee"

    obj1.sayHello()
    obj2.sayHello()
}

----------------------------------------
결과
----------------------------------------
hello mir
hello lee
```

## 생성자

- 객체가 생성될 때 호출되는 함수
- 코틀린에서는 주 생성자와 보조 생성자로 구분

## 주 생성자 (Primary Constructor)

- 하나의 클래스에 하나만 정의
    - 클래스 선언 부분에 작성
    - 하나의 클래스에 하나의 주 생성자만 정의 가능
    - 꼭 작성해야 하는 건 아니며 보조 생성자가 있다면 작성하지 않을 수 있음
- 클래스 몸체가 아닌 헤더에서 클래스 이름 뒤에 선언
- 주 생성자에 별도의 수식 구문 (어노테이션, 접근 제한자 등)이 없다면 contructor 예약어 생략 가능

```kotlin
class MyClass1 { }

class MyClass2() { }

class MyClass3 constructor() { }

fun main(args: Array<String>) {
    val obj1 = MyClass1()
    val obj2 = MyClass2()
    val obj3 = MyClass3()
}
```

- 매개 변수가 있는 주 생성자
    - 주 생성자를 정의할 때 매개변수를 선언하면 해당 생성자로 객체를 생성할 때 매개변수에 맞는 인수를 전달

```kotlin
class User1 constructor(name: String, age: Int) { }
class User2(name: String, age: Int)
// ...
val user1 = User1() // 컴파일 에러
val user2 = User1("mir", 26)
val user3 = User2("lee", 27)
```

- 생성자 매개변수 기본값 명시

```kotlin
class User3(name: String, age: Int = 0) { }
// ...
val user4 = User3("mir", 26)
val user5 = User3("mir")
```

- 생성자 초기화 블록 init

```kotlin
class User4(name: String, age: Int) { } { // 컴파일 에러

}

class User4(name: String, age: Int) {
    init {
        println("init")
    }
}
//..
val user6 = User4("mir", 26)
```

- 생성자 매개변수 값 이용

```kotlin
class User5(name: String, age: Int) {
    init {
        println("init. constructor argument : $name .. $age")
    }

    fun sayHello() {
        println("hello $name") // 컴파일 에러
    }
}

class User5(name: String, age: Int) {
    val name = name

    init {
        println("init. constructor argument : $name .. $age")
    }

    fun sayHello() {
        println("hello $name")
    }
}
//..
val user7 = User5("mir", 26)
user7.sayHello()

----------------------------------------
결과
----------------------------------------
init. constructor argument : mir .. 26
hello mir
```

- 생성자의 매개변수를 선언할 때 val 또는 var 를 추가하면 해당 매개변수는 클래스의 프로퍼티가 된다.
- 따라서 클래스 내에서 따로 선언하지 않아도 사용할 수 있다.

```kotlin
class User6(val name: String, val age: Int) {
    val myName = name

    init {
        println("init. constructor argument : $name .. $age")
    }

    fun sayHello() {
        println("hello $name")
    }
}
```

- 생성자의 매개변수와 클래스의 프로퍼티
    - 생성자의 매개변수와 프로퍼티 변수명은 같을 수 있지만 적용하는 곳이 다르다.

```kotlin
class User7(name: String, age: Int) {
    val name: String = "lee"

    init {
        println("init. constructor argument : $name")
    }

    fun sayHello() {
        println("hello ${name}")
    }
}
//..
val user9 = User7("mir", 26)
user9.sayHello()

----------------------------------------
결과
----------------------------------------
init. constructor argument : mir
hello lee
```

```kotlin
class User8(val name: String, age: Int) {
    val name: String = "lee" // 컴파일 에러
    val age = 10
}
```

## 보조 생성자

- 보조 생성자는 클래스 몸체에 constructor 예약어로 선언
- 클래스를 선언할 때 최소한 하나 이상의 생성자를 정의
    - 보조 생성자를 선언했으면 주 생성자는 선언하지 않아도 된다.
    - 주 생성자든 보조 생성자든 개발자가 생성자를 추가하면 컴파일러는 주 생성자를 자동으로 추가하지 않는다.
    - 컴파일러는 보조 생성자나 주 생성자를 선언하지 않았을 때만 매개변수 없는 주 생성자를 추가한다.

```kotlin
class User1 { } // 컴파일러가 매개변수가 없는 주 생성자 자동 추가
class User2(name: String) { } // 주 생성자만 선언
class User3 {
    constructor(name: String) { } // 보조 생성자만 선언
}

fun main(args: Array<String>) {
    val user1 = User1()
    val user2 = User2()
    val user3 = User3() // 컴파일 에러
    val user4 = User3("mir")
}
```

- 주 생성자와 보조 생성자를 구분하는 이유는?
    - 가독성이 좋고 외부에서 이용할 때 편리
- 어떻게 설계해서 이용하는 게 좋은지?
    - 생성자를 하나만 선언해서 이용해도 된다면 주 생성자만 정의
    - 가독성 및 중요도 측면에서 클래스 헤더에 명시하는 것이 좋다.
    - 생성자를 여러 개 선언 할 경우 공통으로 꼭 전달받아야 하는 데이터가 있따면 이 매개변수만 따로 주 생성자로 선언하고, 나머지 데이터를 전달받기 위한 보조 생성자를 정의해 주는게 좋다.

```kotlin
// 주 생성자로 선언
class User1(name: String, age: Int) { }

// 보조 생성자로 선언
class User2 {
    constructor(name: String, age: Int) { }
}

fun main(args: Array<String>) {
    val user1 = User1("mir", 26)
    val user2 = User2("mir", 26)
}

// 주 생성자와 보조 생성자 동시 선언
class User1(name: String) {
    constructor(name: String, age: Int): this(name) { }
}
```

- 생성자 오버로딩
    - 하나의 클래스 내에 여러 개의 생성자를 선언한 상황
    - 함수의 오버로딩과 마찬가지로 매개변수 부분을 다르게 해서 여러 개 정의할 수 있다.

```kotlin
class User4 {
    constructor() { }
    constructor(name: String) { }
    constructor(name: String, age: Int) { }
}
//..
val user5 = User4()
val user6 = User4("mir")
val user7 = User4("mir", 26)
```

- 보조 생성자와 초기화 블록

```kotlin
class User5 {
    init {
        println("init block...")
    }

    constructor() {
        println("constructor")
    }
}

----------------------------------------
결과
----------------------------------------
init block...
constructor
```

- 보조 생성자의 매개변수 사용

```kotlin
class User6 {
    init {
        println("init block... $name") // 컴파일 에러
    }

    constructor(name: String) {
        println("constructor... $name")
    }

    fun sayHello() {
        println("hello $name") // 컴파일 에러
    }
}
```

```kotlin
class User6 {
    constructor(val name: String) { // 컴파일 에러
        println("constructor... $name")
    }
}
```

## this() 에 의한 생성자 연결

- 주 생성자와 보조 생성자를 선언할 수 있다.
- 주 생성자가 있는 경우 보조 생성자에 this() 구문을 추가해야 한다.
- 보조 생성자 실행 영역이 아닌 선언 영역에 명시 해야한다.
- 객체 생성 시 어떠한 경우에도 주 생성자는 실행되어야 한다.

```kotlin
class User1(name: String) {
    constructor(name: String, age: Int) { // 컴파일 에러

    }
}

class User1(name: String) {
    init { // 주 생성자 초기화 영역
        println("init block... $name")
    }

    constructor(name: String, age: Int): this(name) { // 보조 생성자 선언 영역
        println("constructor ... $name ... $age") // 보조 생성자 실행 영역
    }
}

fun main(args: Array<String>) {
    println("---- 주 생성자로 생성한 경우 ----")
    val user1 = User1("mir")
    println("---- 보조 생성자로 생성한 경우")
    val user1 = User1("mir", 26)
}

----------------------------------------
결과
----------------------------------------
---- 주 생성자로 생성한 경우 ----
init block... mir
---- 보조 생성자로 생성한 경우 ----
init block... mir
constructor ... mir ... 26
```

```kotlin
class User(name: String) {
    init {
        println(name)
    }

    constructor(name: String, age: Int): this(name) {
        println("$name ... $age")
    }

    constructor(name: String, age: Int, email: String): this(name, age) {
        println("$name ... $age ... $email")
    }
}

fun main(args: Array<String>) {
    val user = User("mir", 26, "ddu0422@naver.com")   
}

----------------------------------------
결과
----------------------------------------
mir
mir ... 26
mir ... 26 ... ddu0422@naver.com
```

## 코틀린 vs 자바

- 코틀린에서는 파일 내에 파일명과 같은 public 클래스를 강제하지 않는다.
- 코틀린에는 new 연산자가 없다
- 코틀린의 생성자는 자바와 작성 방법 및 동작 원리가 많이 다르다
    - constructor 예약어를 이용해 생성자 선언
    - 주 생성자와 보조 생성자로 구분
    - 생성자의 초기화 로직을 위해 init() 구문을 사용
    - 주 생성자와 매개변수에 val, var 를 추가하면 클래스의 프로퍼티가 되어 함수에서도 사용 가능