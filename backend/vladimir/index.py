import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Владимир — ИИ советник кликера. Комментирует клики, апгрейды и состояние игры."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    if isinstance(body, str):
        body = json.loads(body)
    trigger = body.get('trigger', 'click')       # click | upgrade | milestone | idle | start
    clicks = body.get('clicks', 0)
    cps = body.get('cps', 0)                     # clicks per second
    upgrades = body.get('upgrades', [])           # список купленных апгрейдов
    cat_name = body.get('catName', 'Мурзик')

    api_key = os.environ.get('OPENAI_API_KEY', '')

    # ── Fallback без ключа ─────────────────────────────────────
    if not api_key:
        fallbacks = {
            'click': [
                f"Мяу! {cat_name} доволен.",
                "Так держать, продолжай кликать!",
                "Каждый клик — шаг к величию.",
                "Хм, неплохо для начала.",
            ],
            'upgrade': [
                "Отличный выбор! Прогресс неизбежен.",
                "Апгрейд куплен — кот счастлив.",
                "Инвестиция в будущее!",
            ],
            'milestone': [
                "Поздравляю с достижением!",
                f"{clicks} кликов — это серьёзно.",
                "Ты на правильном пути.",
            ],
            'idle': [
                "Почему ты не кликаешь?",
                f"{cat_name} скучает без тебя.",
                "Автокликеры работают, но твои клики ценнее.",
            ],
            'start': [
                f"Добро пожаловать! Я Владимир, твой советник. Нажимай на {cat_name}!",
                "Начинаем великий путь кликера!",
            ],
        }
        import random
        msgs = fallbacks.get(trigger, fallbacks['click'])
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'message': random.choice(msgs), 'mood': 'neutral'})
        }

    # ── Системный промпт ───────────────────────────────────────
    system_prompt = """Ты — Владимир, мудрый и слегка саркастичный ИИ-советник в кликер-игре про кота.
Ты говоришь коротко (1-2 предложения максимум), по-русски, с характером.
Иногда философски, иногда иронично, иногда мотивирующе.
Никогда не повторяйся. Упоминай имя кота или конкретные цифры когда уместно.
Не используй emoji в начале, только в конце если очень хочется."""

    # ── Пользовательский промпт по триггеру ───────────────────
    upgrade_list = ', '.join(upgrades[-3:]) if upgrades else 'нет'
    prompts = {
        'click': f"Игрок кликнул на кота {cat_name}. Всего кликов: {clicks:,}. CPS: {cps:.1f}. Скажи что-нибудь про клик.",
        'upgrade': f"Игрок только что купил апгрейд. Последние апгрейды: {upgrade_list}. Всего кликов: {clicks:,}. Прокомментируй покупку.",
        'milestone': f"Игрок достиг {clicks:,} кликов! Это важная веха. Поздравь и дай совет что делать дальше.",
        'idle': f"Игрок не кликал несколько секунд. CPS от автокликеров: {cps:.1f}. Кот {cat_name} ждёт. Позови обратно.",
        'start': f"Игрок только что запустил игру про кота {cat_name}. Поприветствуй его как Владимир и объясни цель в 1-2 предложениях.",
        'prestige': f"Игрок сделал престиж — сбросил {clicks:,} кликов ради бонусов. Прокомментируй это философски.",
    }
    user_msg = prompts.get(trigger, prompts['click'])

    # ── OpenAI запрос ──────────────────────────────────────────
    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_msg},
        ],
        'max_tokens': 80,
        'temperature': 0.9,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())

    message = data['choices'][0]['message']['content'].strip()

    # Определяем настроение по ключевым словам
    mood = 'neutral'
    if any(w in message.lower() for w in ['поздравля', 'отлично', 'браво', 'молодец', 'прекрасно']):
        mood = 'happy'
    elif any(w in message.lower() for w in ['зачем', 'почему', 'лениш', 'скучает', 'ждёт']):
        mood = 'sad'
    elif any(w in message.lower() for w in ['философ', 'мудр', 'жизнь', 'смысл', 'бесконечн']):
        mood = 'wise'

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'message': message, 'mood': mood}, ensure_ascii=False)
    }