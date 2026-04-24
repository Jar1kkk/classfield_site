import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from listings.models import Category, Listing
from accounts.models import User
import random

# Категорії
categories_data = [
    {'name': 'Відеокарти', 'slug': 'videokart', 'description': 'GPU для ігор та роботи'},
    {'name': 'Процесори', 'slug': 'procesory', 'description': 'CPU Intel та AMD'},
    {'name': 'Ноутбуки', 'slug': 'noutbuky', 'description': 'Портативні комп\'ютери'},
    {'name': 'Оперативна пам\'ять', 'slug': 'ram', 'description': 'DDR4, DDR5'},
    {'name': 'Материнські плати', 'slug': 'motherboards', 'description': 'Материнські плати для ПК'},
    {'name': 'Блоки живлення', 'slug': 'psu', 'description': 'Блоки живлення для ПК'},
    {'name': 'Монітори', 'slug': 'monitors', 'description': 'Монітори та дисплеї'},
    {'name': 'Накопичувачі', 'slug': 'storage', 'description': 'SSD, HDD накопичувачі'},
    {'name': 'Охолодження', 'slug': 'cooling', 'description': 'Кулери та системи охолодження'},
    {'name': 'Корпуси', 'slug': 'cases', 'description': 'Корпуси для ПК'},
    {'name': 'Периферія', 'slug': 'periphery', 'description': 'Клавіатури, миші, гарнітури'},
    {'name': 'Мережеве обладнання', 'slug': 'network', 'description': 'Роутери, мережеві карти'},
]

# Оголошення по категоріях
listings_data = {
    'videokart': [
        ('RTX 4090 24GB ASUS ROG', 65000, 'new', 'Нова відеокарта RTX 4090, топова модель для 4K гемінгу. В наявності, є чек.'),
        ('RTX 4070 Ti Super 16GB', 28000, 'new', 'RTX 4070 Ti Super, чудовий вибір для 1440p. Гарантія магазину.'),
        ('RTX 3080 10GB', 18000, 'used', 'Відеокарта RTX 3080, використовувалась 1 рік. Стан відмінний, тест пройшов.'),
        ('RX 7900 XTX 24GB', 35000, 'new', 'AMD RX 7900 XTX, альтернатива RTX 4080. Нова, є гарантія.'),
        ('RTX 3060 12GB', 10000, 'used', 'RTX 3060 12GB, ідеальна для 1080p. Брав для себе, продаю через апгрейд.'),
        ('RX 6700 XT 12GB', 9500, 'refurbished', 'Відновлена RX 6700 XT, перевірена, гарантія 3 місяці.'),
    ],
    'procesory': [
        ('Intel Core i9-14900K', 18000, 'new', 'Флагманський процесор Intel 14 покоління. Новий, запаяний.'),
        ('AMD Ryzen 9 7950X', 22000, 'new', 'Ryzen 9 7950X, 16 ядер. Ідеальний для рендерингу та стрімінгу.'),
        ('Intel Core i7-13700K', 12000, 'used', 'i7-13700K, використовувався 6 місяців. Стан ідеальний.'),
        ('AMD Ryzen 5 7600X', 7500, 'new', 'Ryzen 5 7600X, відмінний процесор для гемінгу. Новий.'),
        ('Intel Core i5-12600K', 6000, 'used', 'i5-12600K, продаю через апгрейд. Стан відмінний.'),
        ('AMD Ryzen 7 5800X', 8000, 'refurbished', 'Ryzen 7 5800X, перевірений, замінена термопаста.'),
    ],
    'noutbuky': [
        ('ASUS ROG Strix G16 RTX 4070', 55000, 'new', 'Ігровий ноутбук з RTX 4070, 16GB RAM, 1TB SSD. Новий, є гарантія.'),
        ('MacBook Pro M3 Pro 14"', 75000, 'new', 'MacBook Pro M3 Pro, 18GB RAM, 512GB SSD. Space Black.'),
        ('Lenovo ThinkPad X1 Carbon', 35000, 'used', 'ThinkPad X1 Carbon Gen 11, i7, 16GB, 512GB. Стан відмінний.'),
        ('Dell XPS 15 OLED', 65000, 'new', 'Dell XPS 15 з OLED дисплеєм, RTX 4060, 32GB RAM.'),
        ('HP Pavilion 15 i5', 18000, 'used', 'HP Pavilion 15, i5-12500H, 16GB, 512GB SSD. Б/у 8 місяців.'),
        ('Acer Nitro 5 RTX 3060', 28000, 'refurbished', 'Ігровий ноутбук Acer Nitro 5 з RTX 3060. Відновлений.'),
    ],
    'ram': [
        ('Kingston Fury Beast DDR5 32GB 6000MHz', 4500, 'new', 'Комплект DDR5 2x16GB 6000MHz. Новий, запаяний.'),
        ('Corsair Vengeance DDR4 32GB 3600MHz', 3200, 'new', 'DDR4 2x16GB 3600MHz RGB. Новий.'),
        ('G.Skill Trident Z5 DDR5 64GB', 9000, 'new', 'DDR5 2x32GB 6400MHz. Топова пам\'ять для AM5.'),
        ('Samsung DDR4 16GB 3200MHz', 1800, 'used', 'Одна планка 16GB DDR4 3200MHz. Стан ідеальний.'),
        ('Crucial DDR5 32GB 4800MHz', 3800, 'used', 'DDR5 2x16GB 4800MHz. Використовувалась 4 місяці.'),
    ],
    'motherboards': [
        ('ASUS ROG Maximus Z790 Hero', 22000, 'new', 'Топова плата для Intel LGA1700. Нова, є всі аксесуари.'),
        ('MSI MAG B650 Tomahawk', 8500, 'new', 'Материнська плата AM5 для Ryzen 7000. Нова.'),
        ('Gigabyte B760M DS3H', 4200, 'new', 'Бюджетна плата LGA1700. Нова, відмінний вибір для i5.'),
        ('ASUS Prime X570-Pro', 6000, 'used', 'AM4 плата для Ryzen 5000. Стан відмінний.'),
        ('MSI Z690 Gaming Plus', 5500, 'refurbished', 'LGA1700 плата, перевірена, гарантія 3 місяці.'),
    ],
    'psu': [
        ('Seasonic Focus GX-1000W 80+ Gold', 6500, 'new', '1000W Gold, повністю модульний. Новий, 10 років гарантії.'),
        ('Corsair RM850x 80+ Gold', 5200, 'new', '850W Gold модульний блок живлення. Новий.'),
        ('be quiet! Straight Power 750W', 4800, 'used', '750W 80+ Gold. Використовувався 1 рік, стан відмінний.'),
        ('EVGA SuperNOVA 650W', 3500, 'refurbished', '650W Gold, перевірений, гарантія 6 місяців.'),
    ],
    'monitors': [
        ('LG 27GP950-B 4K 144Hz Nano IPS', 22000, 'new', '27" 4K 144Hz Nano IPS, HDR600. Новий, є гарантія.'),
        ('Samsung Odyssey G7 32" 240Hz', 18000, 'new', '32" QHD 240Hz VA. Відмінний ігровий монітор.'),
        ('ASUS ProArt PA278QV 27"', 12000, 'used', '27" WQHD IPS, для дизайнерів. Стан ідеальний.'),
        ('AOC 24G2SP 24" 165Hz IPS', 6500, 'new', '24" FHD 165Hz IPS. Бюджетний ігровий монітор.'),
        ('Dell U2722D 27" 4K IPS', 14000, 'refurbished', '27" 4K IPS, USB-C. Відновлений, без дефектів.'),
    ],
    'storage': [
        ('Samsung 990 Pro 2TB NVMe', 5500, 'new', 'NVMe M.2 PCIe 4.0, до 7450 MB/s. Новий.'),
        ('WD Black SN850X 1TB', 3800, 'new', '1TB NVMe PCIe 4.0. Топовий SSD для ігор.'),
        ('Seagate Barracuda 4TB HDD', 2800, 'new', '4TB 3.5" 5400RPM. Для зберігання даних.'),
        ('Kingston NV2 500GB NVMe', 1500, 'used', '500GB M.2 NVMe. Стан відмінний, 200 годин.'),
        ('Crucial MX500 1TB SATA', 1800, 'refurbished', '1TB SATA SSD. Перевірений, гарантія 3 місяці.'),
    ],
    'cooling': [
        ('Noctua NH-D15 chromax.black', 4200, 'new', 'Топовий повітряний кулер. Новий, тихий і ефективний.'),
        ('ARCTIC Liquid Freezer III 360', 5500, 'new', '360mm AIO СРО. Нова, висока ефективність.'),
        ('be quiet! Dark Rock Pro 4', 3200, 'used', 'Повітряний кулер, 250W TDP. Стан відмінний.'),
        ('Deepcool AK620', 2800, 'new', 'Двохбаштовий кулер 260W TDP. Новий.'),
        ('EKWB EK-AIO 240 D-RGB', 4800, 'refurbished', '240mm AIO, відновлена, гарантія 6 місяців.'),
    ],
    'cases': [
        ('Lian Li O11 Dynamic EVO', 8500, 'new', 'Преміум корпус з відмінною вентиляцією. Новий.'),
        ('Fractal Design Meshify 2', 6200, 'new', 'ATX корпус з mesh фронтом. Новий, є гарантія.'),
        ('NZXT H510 Flow', 4500, 'used', 'Mid-tower ATX. Стан відмінний, без подряпин.'),
        ('Cooler Master MasterBox Q500L', 3200, 'new', 'Бюджетний ATX корпус. Новий.'),
        ('Phanteks Eclipse P400A', 4800, 'refurbished', 'ATX корпус з mesh. Відновлений.'),
    ],
    'periphery': [
        ('Logitech G Pro X Superlight 2', 4500, 'new', 'Бездротова ігрова миша 60g. Нова, є гарантія.'),
        ('Keychron Q1 Pro Mechanical', 5800, 'new', 'Механічна клавіатура 75%, RGB. Нова.'),
        ('HyperX Cloud III Wireless', 4200, 'new', 'Бездротова ігрова гарнітура. Нова.'),
        ('Logitech MX Master 3S', 3800, 'used', 'Продуктивна бездротова миша. Стан відмінний.'),
        ('SteelSeries Arctis Nova Pro', 6500, 'new', 'Топова ігрова гарнітура з ANC. Нова.'),
        ('Razer BlackWidow V4 Pro', 5200, 'refurbished', 'Механічна клавіатура, відновлена.'),
    ],
    'network': [
        ('ASUS ROG Rapture GT-AXE16000', 18000, 'new', 'WiFi 6E роутер, топовий для геймерів. Новий.'),
        ('TP-Link Archer AX73', 4500, 'new', 'WiFi 6 роутер AX5400. Новий, є гарантія.'),
        ('Netgear Nighthawk RS700', 12000, 'used', 'WiFi 7 роутер. Стан відмінний, 3 місяці.'),
        ('Intel Wi-Fi 6E AX210', 1200, 'new', 'M.2 WiFi 6E карта. Нова.'),
        ('TP-Link TL-SG1008D Switch', 1800, 'new', '8-портовий гігабітний свіч. Новий.'),
    ],
}

cities = ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів', 'Запоріжжя', 'Рівне', 'Луцьк', 'Вінниця', 'Полтава']

def run():
    # Отримуємо або створюємо юзера для оголошень
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        print('Немає суперюзера! Створи його спочатку.')
        return

    # Створюємо категорії
    created_cats = 0
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name'], 'description': cat_data['description']}
        )
        if created:
            created_cats += 1

    print(f'Категорій створено: {created_cats}')

    # Створюємо оголошення
    created_listings = 0
    for slug, items in listings_data.items():
        try:
            category = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            print(f'Категорія {slug} не знайдена')
            continue

        for title, price, condition, description in items:
            listing, created = Listing.objects.get_or_create(
                title=title,
                defaults={
                    'user': user,
                    'category': category,
                    'price': price,
                    'condition': condition,
                    'description': description,
                    'city': random.choice(cities),
                    'status': 'active',
                }
            )
            if created:
                created_listings += 1

    print(f'Оголошень створено: {created_listings}')
    print('Готово!')

if __name__ == '__main__':
    run()