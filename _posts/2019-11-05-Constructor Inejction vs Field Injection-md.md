---
layout: single
title: Constructor Injectoin vs Field Injection
tag: [Spring]
categories: [Spring]
---

## Field Injection을 사용하지 않고 Constructor Ienjection을 사용해야 하는 이유

1. 의존성이 드러납니다.
    - DI 컨테이너를 사용하는 것은 클래스가 자신의 의존성만 책임지는 게 아니라 제공된 의존성 또한 책임집니다.
    - Field Injection은 클래스 내부에 있어서 어떤 클래스가 DI 되었는지 알 수 없습니다. 즉, 객체를 생성할 때 의존 여부를 알 수 없습니다.
        - IntelliJ에서도 `Field injection is not recommended`라는 메시지를 줍니다.
    - Constructor Injection은 생성 시 의존성을 알 수 있고, 매개 변수 타입이 Interface일 경우 해당 Interfce를 구현하는 Concreate Class를 유연하게 주입할 수 있습니다.

2. SRP를 지킬 수 있습니다.
    - Field Injection을 사용할 경우 해당 클래스의 Bad Smell을 알기 어렵습니다.
    - Constructor Injection을 사용할 경우 해당 클래스의 constructor parameter의 수가 많아지는 걸 더 쉽게 알 수 있습니다.
    - 즉, 클래스의 책임이 얼마나 주어졌는지 파악하기 쉽습니다.

3. 테스트가 쉽습니다.
    - Field Injectoin은 DI 컨테이너에 의존성을 가지게 되어 단위 테스트가 어렵습니다.
        - DI 컨테이너를 사용하지 않으면 단위 테스트 시 NPE(Null Point Exception)가 발생합니다.

            ```java
            public class MainController() {
                
                @Autowired
                private MainService mainService;

                public void doSomething() {
                    mainService.doSomething();
                }
            }

            public class MainService() {
                public void doSomething() {
                    System.out.println("doSomething...");
                }
            }

            public class MainControllerTest() {

                private MainController mainContoller;

                @BeforEach
                void setUp() {
                    mainController = new MainController();
                }

                // 테스트 성공, Junit 5 적용
                @Test
                void test() {
                    assertThrow(NullPointExeption.class, () -> {
                        mainController.doSomething();
                    });
                }
            }
            ```

        - MainController 생성 시점에 MainService가 생성되지 않아서 NPE가 발생하는 걸 볼 수 있습니다.

4. 불변성을 보장합니다.
    - Constructor Injection을 사용하면 field에 final을 붙일 수 있어 불변성이 보장됩니다.

    ```java
    public class MainController {

        private final MainService mainService;

        public MainController(final MainService mainService) {
            this.mainService = mainService;
        }
    }
    ```

5. 순환 참조를 알기 쉽습니다.

#### Constructor Injection은 실행 시점에 순환 참조를 알 수 있습니다.  

<img src="/assets/images/spring/constructor_injection_circle_reference.png" alt="생성자 주입 순환 참조 시" />

#### Field Injection은 사용 시점에 순환 참조를 알 수 있습니다. 이 경우에는 해당 메서드를 사용 시 순환 참조가 일어나면서 StackOverFlow 에러가 발생합니다.  

<img src="/assets/images/spring/field_injection_circle_reference.png" width="100%" alt="필드 주입 순환 참조 시" />