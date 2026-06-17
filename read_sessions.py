import json, os, glob

sessions_dir = '/home/ubuntu/.hermes/sessions'
files = sorted(glob.glob(os.path.join(sessions_dir, 'request_dump_*.json')), key=os.path.getmtime)
if not files:
    print('No session files found')
else:
    latest = files[-1]
    print('Latest file:', os.path.basename(latest), 'size:', os.path.getsize(latest))
    data = json.load(open(latest))
    print('Keys:', list(data.keys()))
    
    req = data.get('request', data)
    if isinstance(req, str):
        print('REQUEST:', req[:500])
    elif isinstance(req, dict):
        print('Request keys:', list(req.keys())[:10])
        for k in ['messages', 'conversation', 'history', 'prompt', 'content']:
            v = req.get(k, [])
            if isinstance(v, list) and len(v) > 0:
                print('Found', k, 'with', len(v), 'items')
                for m in v[-6:]:
                    r = m.get('role', '?')
                    c = str(m.get('content', ''))[:300]
                    print(r + ': ' + c)
                break
    
    err = data.get('error', '')
    if err:
        print('ERROR:', str(err)[:500])
