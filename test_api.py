import json
files = [
    '/home/ubuntu/.hermes/sessions/request_dump_20260617_010443_8585e11d_20260617_012541_143886.json',
    '/home/ubuntu/.hermes/sessions/request_dump_20260617_004608_93ccf9_20260617_004613_327184.json',
]
for f in files:
    try:
        data = json.load(open(f))
        msgs = data.get('messages', data.get('history', data.get('conversation', [])))
        if not msgs:
            keys = list(data.keys())[:10]
            print(f + ': looking for messages... keys=' + str(keys))
            continue
        fname = f.split('/')[-1]
        print('File: ' + fname + ' (' + str(len(msgs)) + ' messages)')
        for m in msgs[-6:]:
            role = m.get('role', '?')
            content = str(m.get('content', ''))[:250]
            print(role + ': ' + content)
        print()
    except Exception as e:
        print(f + ': Error: ' + str(e))
