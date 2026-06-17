import json, os, glob

sessions_dir = '/home/ubuntu/.hermes/sessions'
files = sorted(glob.glob(os.path.join(sessions_dir, 'request_dump_*.json')), key=os.path.getmtime)
latest = files[-1]
data = json.load(open(latest))
req = data.get('request', {})

body = req.get('body', {})
if isinstance(body, dict):
    messages = body.get('messages', [])
    for m in messages[-4:]:
        role = m.get('role', '?')
        content = str(m.get('content', ''))[:500]
        print(role + ':', content)
        print('---')
    model = body.get('model', '')
    print('Model:', model)
elif isinstance(body, str):
    print(body[:1000])

# Also check other dumps for user messages
print('\n\n=== OTHER DUMPS ===')
for f in files[-3:-1]:
    d = json.load(open(f))
    req2 = d.get('request', {})
    body2 = req2.get('body', {})
    if isinstance(body2, dict):
        msgs2 = body2.get('messages', [])
        for m in msgs2[-2:]:
            r = m.get('role', '?')
            c = str(m.get('content', ''))[:300]
            print(os.path.basename(f) + ' - ' + r + ':', c)
