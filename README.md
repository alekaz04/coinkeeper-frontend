# CoinKeeper Frontend

Современное Angular-приложение для управления личными финансами.

## 🚀 Технологии

- **Angular**: 17.3
- **TypeScript**: 5.4
- **Angular Material**: 17.3
- **RxJS**: 7.8
- **Chart.js**: 4.4 (через ng2-charts 6.0)
- **date-fns**: 3.x

## 📁 Структура проекта

```
src/
├── app/
│   ├── core/                    # Singleton сервисы и guards
│   │   ├── guards/              # Route guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # TypeScript интерфейсы
│   │   └── services/            # Core сервисы
│   ├── shared/                  # Переиспользуемые компоненты
│   │   ├── components/          # Shared компоненты
│   │   ├── directives/          # Директивы
│   │   ├── pipes/               # Пайпы
│   │   └── utils/               # Утилиты
│   ├── features/                # Функциональные модули
│   │   ├── auth/                # Аутентификация
│   │   ├── dashboard/           # Дашборд
│   │   ├── operations/          # Операции
│   │   ├── accounts/            # Счета
│   │   ├── categories/          # Категории
│   │   └── planned-operations/  # Плановые операции
│   └── layout/                  # Компоненты макета
│       ├── header/              # Шапка
│       ├── sidebar/             # Боковое меню
│       └── footer/              # Подвал
├── environments/                # Конфигурация окружений
├── assets/                      # Статические ресурсы
└── styles.scss                  # Глобальные стили
```

## 🛠️ Установка и запуск

### Предварительные требования

- Node.js 18+ и npm
- Angular CLI (`npm install -g @angular/cli`)

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm start
# или
ng serve
```

Приложение будет доступно по адресу `http://localhost:4200`

### Сборка для production

```bash
npm run build
# или
ng build --configuration production
```

## 🔧 Конфигурация

### Окружения

Настройки окружений находятся в `src/environments/`:

- `environment.ts` - Development
- `environment.prod.ts` - Production

### Path Aliases

Настроены следующие алиасы для импорта:

```typescript
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { HeaderComponent } from '@layout/header/header.component';
import { environment } from '@environments/environment';
```

## 📝 Основные функции

### MVP (Минимально жизнеспособный продукт)

- ✅ Аутентификация и авторизация (JWT)
- ✅ Управление операциями (доходы/расходы)
- ✅ Управление счетами
- ✅ Управление категориями
- ✅ Плановые операции (регулярные платежи)
- ✅ Дашборд с аналитикой

### Будущие улучшения

- 🔄 Темная тема
- 🔄 Экспорт/импорт данных
- 🔄 Множественные валюты
- 🔄 Бюджетирование
- 🔄 PWA с офлайн-режимом

## 🎨 Стили и темизация

Проект использует Angular Material с кастомной темой Indigo-Pink.

### Утилитарные классы

```scss
.full-width      // width: 100%
.text-center     // text-align: center

// Margins
.mt-1, .mt-2, .mt-3, .mt-4  // margin-top
.mb-1, .mb-2, .mb-3, .mb-4  // margin-bottom

// Padding
.p-1, .p-2, .p-3, .p-4      // padding

// Цвета операций
.income          // Зеленый для доходов
.expense         // Красный для расходов
```

## 🧪 Тестирование

### Unit тесты

```bash
npm test
# или
ng test
```

### E2E тесты

```bash
npm run e2e
```

## 📚 API Integration

Backend API доступен по адресу:
- Development: `http://localhost:5000/api`
- Production: `https://coinkeeper-back.lvakarin.ru/api`

Полная документация API находится в `memory-bank/apiReference.md`

## 🏗️ Архитектурные паттерны

### Smart/Dumb Components

- **Smart Components**: Управляют состоянием и бизнес-логикой
- **Dumb Components**: Отображают данные и генерируют события

### Service Layer

Вся бизнес-логика инкапсулирована в сервисах с использованием RxJS.

### Reactive Forms

Все формы используют Reactive Forms для лучшей типизации и тестируемости.

### Lazy Loading

Все feature модули загружаются по требованию для оптимизации производительности.

## 📖 Документация

Подробная документация проекта находится в папке `memory-bank/`:

- `projectbrief.md` - Описание проекта и целей
- `productContext.md` - Контекст продукта
- `systemPatterns.md` - Архитектурные паттерны
- `techContext.md` - Технический контекст
- `apiReference.md` - Справочник API
- `activeContext.md` - Текущий контекст разработки
- `progress.md` - Прогресс разработки

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект создан в образовательных целях.

## 👥 Авторы

CoinKeeper Frontend Team

## 🙏 Благодарности

- Angular Team за отличный фреймворк
- Material Design за UI компоненты
- Сообщество разработчиков за поддержку
