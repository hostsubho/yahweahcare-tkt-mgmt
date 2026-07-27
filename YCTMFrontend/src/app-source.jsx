
        // All data sourced from API — no hardcoded fallbacks

        // ── Lazy Chart.js loader — loads once, reuses cached promise ──────────
        let _chartJsPromise = null;
        function loadChartJs() {
            if (window.Chart) return Promise.resolve();
            if (_chartJsPromise) return _chartJsPromise;
            _chartJsPromise = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
                s.onload = resolve;
                s.onerror = () => { _chartJsPromise = null; reject(new Error('Chart.js load failed')); };
                document.head.appendChild(s);
            });
            return _chartJsPromise;
        }

        // ── Professional SVG Icon System ──────────────────────────────────────
        // Usage: <Icon name="dashboard" size={16} color="currentColor" />
        function Icon({ name, size = 16, color = 'currentColor', style = {} }) {
            const d = {
                // Navigation
                'dashboard':       'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
                'plus-circle':     'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 8v8 M8 12h8',
                'clipboard-list':  'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 12h6 M9 16h6 M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z',
                'calendar':        'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
                'trending-up':     'M22 7l-8.5 8.5-5-5L2 17 M16 7h6v6',
                'building-2':      'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
                'star':            'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
                'refresh-cw':      'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16 M3 21v-5h5',
                'users':           'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
                'scroll-text':     'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8',
                'send':            'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z M21.854 2.147l-10.94 10.939',
                'mail':            'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
                'mail-cog':        'M22 10.5V6l-8.29 5.26a2 2 0 0 1-2.22 0L2 6v12a2 2 0 0 0 2 2h7.5 M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2 M19.12 17.86a2.04 2.04 0 1 0 .01 0h-.01 M22 14a4 4 0 0 0-5.27 1.55 M16.73 14a4 4 0 0 1 5.27 1.55',
                // Status & Actions
                'check-circle':    'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
                'x-circle':        'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M15 9l-6 6 M9 9l6 6',
                'alert-triangle':  'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
                'alert-octagon':   'M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z M12 8v4 M12 16h.01',
                'alert-circle':    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 8v4 M12 16h.01',
                'clock':           'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6l4 2',
                'hourglass':       'M5 22h14 M5 2h14 M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22 M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2',
                'arrow-up-circle': 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 16V8 M8 12l4-4 4 4',
                'user':            'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
                'award':           'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.21 13.89 7 23l5-3 5 3-1.21-9.12',
                'sparkles':        'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z M20 3v4 M22 5h-4 M4 17v2 M5 18H3',
                'lock':            'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
                'lock-open':       'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 9.9-1',
                'bell':            'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
                'bell-ring':       'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0 M2 8c0-3.31 1.34-6.31 3.5-8.49 M22 8c0-3.31-1.34-6.31-3.5-8.49',
                'message-square':  'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
                'paperclip':       'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48',
                'zap':             'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
                'pause-circle':    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M10 15V9 M14 15V9',
                'map-pin':         'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
                'settings':        'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
                'log-out':         'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
                'search':          'M21 21l-4.35-4.35 M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
                // Ticket types
                'ticket':          'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z',
                'inbox':           'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
                'loader':          'M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83',
                'tag':             'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z M7.5 7.5h.01',
                'file-edit':       'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
                // Charts & reports
                'bar-chart':       'M3 3v18h18 M7 16v-5 M11 16V8 M15 16v-3 M19 16V5',
                'bar-chart-2':     'M18 20V10 M12 20V4 M6 20v-6',
                'pie-chart':       'M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10z',
                'activity':        'M22 12h-4l-3 9L9 3l-3 9H2',
                'target':          'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
                'folder':          'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z',
                // Category icons
                'user-check':      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 11l2 2 4-4',
                'key':             'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
                'shield':          'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
                'wrench':          'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
                'clipboard':       'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z',
                'hard-hat':        'M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z M10 10V5a2 2 0 0 1 4 0v5 M5 15v-3a7 7 0 0 1 14 0v3',
                'dollar-sign':     'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
                'heart-handshake': 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66 M18 15l2 2 M15 18l2 2',
                'broom':           'M7 21l-4.3-4.3c-1-1-.9-2.5.1-3.4l9.6-8.8c.9-.8 2.3-.7 3.1.2l.4.4c.8.9.7 2.3-.2 3.1L8.7 16.6c-.9.8-.8 2.3.1 3.2L11 22',
                'git-branch':      'M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9',
                'git-compare':     'M16 3h5v5 M8 3H3v5 M21 3l-7.536 7.536A5 5 0 0 0 12 14.07V21 M3 3l7.536 7.536A5 5 0 0 1 12 14.07',
                'info':            'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 8h.01 M12 12v4',
                'percent':         'M19 5 5 19 M6.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M17.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
                'phone':           'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
                'users-minus':     'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 11h-6',
                'cpu':             'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 0-2-2V9m0 0h18',
                'monitor':         'M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9 M2 16h20 M8 21h8 M12 16v5',
                'heart':           'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
                'help-circle':     'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01',
                'tool':            'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
                'building':        'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
                'briefcase':       'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M2 9h20v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z',
                'layers':          'M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
                'chevron-right':   'M9 18l6-6-6-6',
                'chevron-down':    'M6 9l6 6 6-6',
                'check':           'M20 6 9 17l-5-5',
                'x':               'M18 6 6 18 M6 6l12 12',
                'download':        'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
                'upload':          'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
                'external-link':   'M15 3h6v6 M10 14 21 3 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
                'link':            'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
                'more-horizontal': 'M8 12h.01 M12 12h.01 M16 12h.01',
                'eye':             'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
                'trash-2':         'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6',
                'pencil':          'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
                'filter':          'M22 3H2l8 9.46V19l4 2v-8.54z',
                'sort':            'M3 6h18 M7 12h10 M10 18h4',
                'truck':           'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
                'user-x':          'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M18 8l4 4m0-4l-4 4',
                'chevron-up':      'M18 15l-6-6-6 6',
            }[name];
            if (!d) return null;
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
                    stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                    style={{display:'inline-block',verticalAlign:'middle',flexShrink:0,...style}}
                    aria-hidden="true">
                    <path d={d} />
                </svg>
            );
        }

        // ── Global category visual lookup ──────────────────────────
        // Shared by Create Ticket, Tickets table, detail drawer, etc.
        // Pass a category label string → returns { icon, color, bg, border }
        const CAT_VISUAL_MAP = {
            // DB string id matches
            client:    { icon:'user',          color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE' },
            account:   { icon:'key',            color:'#833089', bg:'#F5F3FF', border:'#DDD6FE' },
            hr:        { icon:'briefcase',      color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
            cleaning:  { icon:'sparkles',       color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
            safety:    { icon:'shield',         color:'#EF4444', bg:'#FEF2F2', border:'#FECACA' },
            equipment: { icon:'tool',           color:'#833089', bg:'#F6ECF4', border:'#E3BFDA' },
            ndis:      { icon:'clipboard-list', color:'#0EA5E9', bg:'#F0F9FF', border:'#BAE6FD' },
            // Label keyword matches (longest wins)
            'it support':       { icon:'monitor',       color:'#833089', bg:'#F6ECF4', border:'#E3BFDA' },
            'hr & payroll':     { icon:'briefcase',     color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
            'facilities & mai': { icon:'building',      color:'#64748B', bg:'#F8FAFC', border:'#CBD5E1' },
            'care coord':       { icon:'heart',         color:'#EC4899', bg:'#FDF2F8', border:'#FBCFE8' },
            'clinical':         { icon:'activity',      color:'#0EA5E9', bg:'#F0F9FF', border:'#BAE6FD' },
            'compliance':       { icon:'shield',        color:'#833089', bg:'#F5F3FF', border:'#DDD6FE' },
            'finance':          { icon:'dollar-sign',   color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
            'general enquiry':  { icon:'help-circle',   color:'#64748B', bg:'#F8FAFC', border:'#CBD5E1' },
            'incident':         { icon:'alert-triangle', color:'#E11D48', bg:'#FFF1F2', border:'#FECDD3' },
            'payroll':          { icon:'briefcase',     color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
            'facilities':       { icon:'building',      color:'#64748B', bg:'#F8FAFC', border:'#CBD5E1' },
            'maintenance':      { icon:'tool',          color:'#64748B', bg:'#F8FAFC', border:'#CBD5E1' },
            'safety':           { icon:'shield',        color:'#EF4444', bg:'#FEF2F2', border:'#FECACA' },
            'care':             { icon:'heart',         color:'#EC4899', bg:'#FDF2F8', border:'#FBCFE8' },
            'general':          { icon:'help-circle',   color:'#64748B', bg:'#F8FAFC', border:'#CBD5E1' },
            'ndis':             { icon:'clipboard-list',color:'#0EA5E9', bg:'#F0F9FF', border:'#BAE6FD' },
            'client':           { icon:'user',          color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE' },
            'account':          { icon:'key',           color:'#833089', bg:'#F5F3FF', border:'#DDD6FE' },
            'equipment':        { icon:'tool',          color:'#833089', bg:'#F6ECF4', border:'#E3BFDA' },
            'it':               { icon:'monitor',       color:'#833089', bg:'#F6ECF4', border:'#E3BFDA' },
        };
        function getCatVisual(label) {
            if (!label) return { icon:'folder', color:'#94A3B8', bg:'#F8FAFC', border:'#E2E8F0' };
            const low = label.toLowerCase();
            // Exact id key first
            if (CAT_VISUAL_MAP[low]) return { ...CAT_VISUAL_MAP[low], label };
            // Longest substring match
            const key = Object.keys(CAT_VISUAL_MAP)
                .filter(k => low.includes(k))
                .sort((a,b) => b.length - a.length)[0];
            return key ? { ...CAT_VISUAL_MAP[key], label } : { icon:'folder', color:'#94A3B8', bg:'#F8FAFC', border:'#E2E8F0', label };
        }
        // Inline category badge — icon pill used in tables and drawers
        function CatBadge({ label, size='sm' }) {
            const v = getCatVisual(label);
            const isLg = size === 'lg';
            return (
                <span style={{
                    display:'inline-flex', alignItems:'center', gap: isLg ? '6px' : '4px',
                    padding: isLg ? '4px 10px 4px 6px' : '2px 8px 2px 4px',
                    borderRadius:'20px',
                    background: v.bg, border:`1px solid ${v.border}`,
                    fontSize: isLg ? '12px' : '11px', fontWeight:600, color: v.color,
                    whiteSpace:'nowrap',
                }}>
                    <span style={{
                        width: isLg ? '20px' : '16px', height: isLg ? '20px' : '16px',
                        borderRadius:'50%', background: v.color,
                        display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    }}>
                        <Icon name={v.icon} size={isLg ? 11 : 9} color='#fff' />
                    </span>
                    {label || '—'}
                </span>
            );
        }

        // ── Shared: resize/compress an uploaded image file into a small square
        // JPEG data URL (center-cropped). Used by the profile-photo upload UI
        // on both the My Profile (Settings) page and the Staff Management edit
        // modal. Keeping this client-side avoids needing any file-storage
        // service — the resulting data URL (usually 15-40KB) is small enough
        // to store directly in the users.profile_photo_url TEXT column.
        function resizeImageToDataUrl(file, maxSize = 200, quality = 0.82) {
            return new Promise((resolve, reject) => {
                if (!file || !(file.type || '').startsWith('image/')) return reject(new Error('Please choose an image file.'));
                if (file.size > 8 * 1024 * 1024) return reject(new Error('Image is too large (max 8MB).'));
                const reader = new FileReader();
                reader.onerror = () => reject(new Error('Could not read the selected file.'));
                reader.onload = () => {
                    const img = new Image();
                    img.onerror = () => reject(new Error('Could not decode the selected image.'));
                    img.onload = () => {
                        const side = Math.min(img.width, img.height);
                        const sx = (img.width - side) / 2;
                        const sy = (img.height - side) / 2;
                        const canvas = document.createElement('canvas');
                        canvas.width = maxSize; canvas.height = maxSize;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }

        // Shared circular avatar-with-upload control — shows the current photo
        // (or initials if none), a small camera-badge button that opens a file
        // picker, resizes/compresses the chosen image, and calls onPhotoChange
        // with the resulting data URL (or onError with a message on failure).
        function AvatarUpload({ name, photoUrl, size = 76, onPhotoChange, onError, disabled = false }) {
            const fileRef = React.useRef(null);
            const [busy, setBusy] = React.useState(false);
            const ini = (name || '').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
            const colors = ['#6D2773', '#0A6ABD', '#689C35', '#874E8C', '#3685C9', '#4E7528'];
            const bg = colors[(name || '').charCodeAt(0) % colors.length] || '#6D2773';
            const handleFile = async (e) => {
                const file = e.target.files && e.target.files[0];
                e.target.value = ''; // allow re-selecting the same file later
                if (!file) return;
                setBusy(true);
                try {
                    const dataUrl = await resizeImageToDataUrl(file);
                    onPhotoChange && onPhotoChange(dataUrl);
                } catch (err) {
                    onError && onError(err.message || 'Could not process that image.');
                } finally {
                    setBusy(false);
                }
            };
            return (
                <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
                    {photoUrl ? (
                        <img src={photoUrl} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                        <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 600, letterSpacing: '0.02em', color: 'white' }}>{ini}</div>
                    )}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => fileRef.current && fileRef.current.click()}
                            title="Change photo"
                            style={{
                                position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%',
                                background: '#6D2773', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: busy ? 'default' : 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                            }}
                            disabled={busy}
                        >
                            {busy ? <Icon name='loader' size={13} color='#fff' /> : <Icon name='pencil' size={13} color='#fff' />}
                        </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={disabled || busy} />
                </div>
            );
        }

        // Small inline pill flagging a deactivated staff member wherever their
        // name is shown on a ticket (assignee or requester) — driven by the
        // assigneeActive/requesterActive flags added to the tickets API.
        function ExStaffBadge() {
            return (
                <span title="This person no longer works at Yahwehcare" style={{
                    display:'inline-block', marginLeft:'6px', fontSize:'9px', fontWeight:700,
                    color:'#991B1B', background:'#FEF2F2', border:'1px solid #FECACA',
                    borderRadius:'10px', padding:'1px 6px', verticalAlign:'middle',
                }}>No longer with Yahwehcare</span>
            );
        }

        // Shared numbered-page-button pagination bar — same look/behaviour as
        // the main Tickets page's pager (Showing X-Y of Z, first/last/current±1
        // page buttons with ellipsis, Prev/Next, Rows-per-page selector).
        // Colors are passed in so each host page's own light/dark palette applies.
        function PageBar({ page, setPage, pageSize, setPageSize, total, itemLabel = 'item', itemLabelPlural, dm, bg, border, muted }) {
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const safePage   = Math.min(Math.max(1, page), totalPages);
            const pageStart  = (safePage - 1) * pageSize;

            const btn = (label, onClick, disabled, active = false) => (
                <button key={label} onClick={onClick} disabled={disabled}
                    style={{minWidth:32,height:32,padding:'0 6px',borderRadius:6,border:`1px solid ${active?'#833089':border}`,background:active?'#833089':bg,color:active?'#fff':disabled?(dm?'#3a4f6a':'#CBD5E1'):(dm?'#DDA8D1':'#4B5563'),fontSize:13,fontWeight:active?700:500,cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s'}}>
                    {label}
                </button>
            );

            const pages = [];
            const addPage = n => { if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n); };
            addPage(1); addPage(totalPages);
            for (let i = safePage - 1; i <= safePage + 1; i++) addPage(i);
            pages.sort((a, b) => a - b);
            const pageButtons = [];
            let prev = 0;
            for (const p of pages) {
                if (p - prev > 1) pageButtons.push(<span key={`e${p}`} style={{color:muted,fontSize:13,padding:'0 2px'}}>…</span>);
                pageButtons.push(btn(p, () => setPage(p), false, p === safePage));
                prev = p;
            }

            return (
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,padding:'12px 16px',borderTop:`1px solid ${border}`}}>
                    <span style={{fontSize:12.5,color:muted,flexShrink:0}}>
                        {total === 0 ? 'No results' : `Showing ${pageStart+1}–${Math.min(pageStart+pageSize,total)} of ${total} ${total!==1?(itemLabelPlural||`${itemLabel}s`):itemLabel}`}
                    </span>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                        {btn('‹ Prev', () => setPage(p => Math.max(1, p - 1)), safePage === 1)}
                        {pageButtons}
                        {btn('Next ›', () => setPage(p => Math.min(totalPages, p + 1)), safePage === totalPages)}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                        <span style={{fontSize:12.5,color:muted}}>Rows</span>
                        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                            style={{fontSize:12.5,padding:'3px 6px',borderRadius:6,border:`1px solid ${border}`,background:bg,color:dm?'#DDA8D1':'#374151',cursor:'pointer'}}>
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
            );
        }



        // API Service Layer — all routes go to YCTMBackend (HRMS_API)
        // API_BASE_URL kept for legacy references; both point to the same deployed backend.
        const HRMS_API = window.__API_URL__ ||
            (window.location.hostname === 'localhost'
                ? 'http://localhost:4001'
                : 'https://yahweahcare-tkt-mgmt-hx48.vercel.app');
        const API_BASE_URL = HRMS_API; // alias — old code used API_BASE_URL

        // Helper: read the logged-in user from sessionStorage
        function getSessionUser() {
            try { return JSON.parse(sessionStorage.getItem('ms_current_user') || 'null'); } catch { return null; }
        }

        // ── Auth helpers: Bearer token for cross-origin API calls ──────────────
        function getAccessToken() {
            return sessionStorage.getItem('ms_access_token') || null;
        }

        // Build headers with Authorization: Bearer for authenticated requests
        function authHeaders(extra = {}) {
            const token = getAccessToken();
            const h = { 'Content-Type': 'application/json', ...extra };
            if (token) h['Authorization'] = `Bearer ${token}`;
            return h;
        }

        // Refresh the access token using the refresh cookie; update sessionStorage
        // Returns true if successful. Called automatically before expiry.
        async function refreshAccessToken() {
            try {
                const res = await fetch(`${HRMS_API}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.accessToken) {
                        sessionStorage.setItem('ms_access_token', data.accessToken);
                        return true;
                    }
                }
            } catch (_) {}
            return false;
        }

        // Authenticated fetch — on 401, auto-refresh token and retry once.
        // On second 401, redirects to login page UNLESS opts.noRedirect is true.
        async function authFetch(url, opts = {}) {
            const { noRedirect, ...fetchOpts } = opts;
            const res = await fetch(url, { credentials: 'include', ...fetchOpts, headers: authHeaders(fetchOpts.headers || {}) });
            if (res.status !== 401) return res;
            // Try refreshing token once
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                if (noRedirect) return res; // caller handles the 401 gracefully
                // Token and refresh both failed — bounce to login
                sessionStorage.clear();
                window.location.href = window.location.pathname + '?session_expired=1';
                return res;
            }
            // Retry with fresh token
            return fetch(url, { credentials: 'include', ...fetchOpts, headers: authHeaders(fetchOpts.headers || {}) });
        }

        // Schedule a token refresh 2 minutes before the 15-minute access token expiry
        (function scheduleTokenRefresh() {
            const REFRESH_INTERVAL_MS = 13 * 60 * 1000; // 13 min (token lasts 15 min)
            setInterval(async () => {
                if (getAccessToken()) await refreshAccessToken();
            }, REFRESH_INTERVAL_MS);
        })();

        // Role-based scope for ticket queries
        // Returns query params to append to any /tickets fetch
        function getTicketScopeParams(sessionUser) {
            if (!sessionUser) return {};
            const { id, isBootstrapAdmin, positionType, deptId } = sessionUser;
            // Bootstrap admin or Director → see everything
            if (isBootstrapAdmin || positionType === 'director') {
                return { scope: 'all', userId: id };
            }
            // Management positions → see all tickets in their department
            if (['ops', 'finance', 'strategic'].includes(positionType)) {
                const p = { scope: 'dept', userId: id };
                if (deptId) p.deptId = deptId;
                return p;
            }
            // Everyone else (staff, external, approver by ticket) → own + pending-approval tickets
            return { scope: 'mine', userId: id };
        }

        // Returns query params for /users fetch based on role
        // Admin/Director → no filter (all users)
        // Manager        → ?dept_id=N  (their department only)
        // Staff/external → ?dept_id=N  (their department, so they can see colleagues)
        function getUserQueryParams(sessionUser) {
            if (!sessionUser) return '';
            const { isBootstrapAdmin, positionType, deptId } = sessionUser;
            if (isBootstrapAdmin || positionType === 'director') return '';
            if (deptId) return `&dept_id=${deptId}`;
            return '';
        }

        // Build URLSearchParams string for /tickets/activity scope
        function getActivityScopeParams(sessionUser) {
            if (!sessionUser) return '';
            const sp = getTicketScopeParams(sessionUser);
            const p = new URLSearchParams();
            if (sp.scope)  p.set('scope',  sp.scope);
            if (sp.userId) p.set('userId', String(sp.userId));
            if (sp.deptId) p.set('deptId', String(sp.deptId));
            return p.toString() ? `&${p.toString()}` : '';
        }

        // ── Page access control ────────────────────────────────────────────────
        // Returns the set of page IDs the current user may visit.
        //   Staff (default)        → dashboard, create-ticket, tickets, calendar, analytics
        //   Dept Manager           → + org-chart, staff-performance, team-comparison
        //   HR Manager             → + staff-management  (also gets manager pages)
        //   Director / Bootstrap   → all pages
        const STAFF_PAGES    = ['dashboard','create-ticket','tickets','calendar','analytics','settings'];
        const MANAGER_PAGES  = [...STAFF_PAGES, 'org-chart','staff-performance','team-comparison','ticket-log','vehicle-management'];
        const HR_PAGES       = [...MANAGER_PAGES, 'staff-management'];
        const DIRECTOR_PAGES    = [...HR_PAGES, 'scheduled-reports'];
        const BOOTSTRAP_PAGES   = [...DIRECTOR_PAGES, 'email-config', 'ex-staff', 'activity-log'];

        function getAccessiblePages(sessionUser) {
            if (!sessionUser) return STAFF_PAGES;
            const { isBootstrapAdmin, positionType, role, vehicleAccess } = sessionUser;
            // vehicle-management on top of whatever tier the user already has,
            // if they were individually granted vehicle access in Staff Management.
            const withVehicleOverride = (pages) =>
                vehicleAccess && !pages.includes('vehicle-management') ? [...pages, 'vehicle-management'] : pages;
            // Bootstrap admin gets everything including email-config
            if (isBootstrapAdmin) return BOOTSTRAP_PAGES;
            // Director level: director position, or admin/super_admin role
            if (positionType === 'director'
                || role === 'super_admin' || role === 'admin') return withVehicleOverride(DIRECTOR_PAGES);
            // HR Manager: hr role
            if (role === 'hr')                                   return withVehicleOverride(HR_PAGES);
            // Department Manager: ops/finance/strategic position, or manager role
            if (['ops','finance','strategic'].includes(positionType)
                || role === 'manager')                           return withVehicleOverride(MANAGER_PAGES);
            return withVehicleOverride(STAFF_PAGES);
        }

        // Returns badge config that visually distinguishes Bootstrap Admin from Director
        // Bootstrap Admin = system role (not in org hierarchy); Director = org leadership role
        function getRoleBadgeInfo(user) {
            if (!user) return null;
            if (user.isBootstrapAdmin)
                return { label:'Bootstrap Admin', desc:'System Administration — not part of org hierarchy',
                         bg:'#F0E9F1', color:'#521D56', border:'#DBC9DC', dot:'#6D2773' };
            const pt = (user.positionType || '').toLowerCase();
            const r  = (user.role || '').toLowerCase();
            if (pt === 'director' || r === 'director')
                return { label:'Director', desc:'Organisational Leadership — part of org hierarchy',
                         bg:'#F0E9F1', color:'#521D56', border:'#DBC9DC', dot:'#6D2773' };
            if (r === 'hr')
                return { label:'HR Manager', desc:'Human Resources Department',
                         bg:'#EFEBF2', color:'#5A4870', border:'#DBD2E3', dot:'#8B7BA8' };
            if (r === 'manager' || ['ops','finance','strategic'].includes(pt))
                return { label:'Manager', desc:'Department Manager',
                         bg:'#EDF1F4', color:'#3E5A70', border:'#D8E1E8', dot:'#5B7C99' };
            return { label:'Staff', desc:'Staff Member',
                     bg:'#EDF0F0', color:'#455251', border:'#D9E0DF', dot:'#6B8E7F' };
        }

        // Fallback mock data — IDs must match actual DB seed values
        const LOOKUPS_MOCK = {
            categories: [
                { id: 'client',    label: 'Client Issue',     icon: 'user' },
                { id: 'account',   label: 'Account Issue',    icon: 'key' },
                { id: 'hr',        label: 'HR Issue',         icon: 'users' },
                { id: 'cleaning',  label: 'Cleaning Quality', icon: 'star' },
                { id: 'safety',    label: 'Safety Concern',   icon: 'shield' },
                { id: 'equipment', label: 'Equipment Issue',  icon: 'tool' },
                { id: 'ndis',      label: 'NDIS Compliance',  icon: 'clipboard' }
            ],
            priorities: [
                { id: 'urgent', label: 'Urgent', sla_hours: 2 },
                { id: 'high',   label: 'High',   sla_hours: 8 },
                { id: 'medium', label: 'Medium', sla_hours: 24 },
                { id: 'low',    label: 'Low',    sla_hours: 72 }
            ],
            statuses: [
                { id: 'open',             label: 'Open' },
                { id: 'in_progress',      label: 'In Progress' },
                { id: 'pending_approval', label: 'Pending Approval' },
                { id: 'resolved',         label: 'Resolved' },
                { id: 'closed',           label: 'Closed' }
            ]
        };

        const API = {
            lookups: {
                get: async () => {
                    // Cache in sessionStorage for 5 minutes — lookups are static per session
                    const CACHE_KEY = 'yc_lookups';
                    const CACHE_TTL = 30 * 60 * 1000; // 30 min — lookup data is effectively static
                    try {
                        const cached = sessionStorage.getItem(CACHE_KEY);
                        if (cached) {
                            const { data, ts } = JSON.parse(cached);
                            if (Date.now() - ts < CACHE_TTL) return data;
                        }
                    } catch(_) {}
                    try {
                        const res = await fetch(`${HRMS_API}/lookup/all`);
                        if (!res.ok) throw new Error('lookup not responding');
                        const data = await res.json();
                        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch(_) {}
                        return data;
                    } catch (err) {
                        console.log('Using mock lookups data');
                        return LOOKUPS_MOCK;
                    }
                }
            },
            tickets: {
                getAll: async (opts = {}) => {
                    const params = new URLSearchParams();
                    if (opts.all)    params.set('all', '1');
                    if (opts.status) params.set('status', opts.status);
                    if (opts.limit)  params.set('limit', String(opts.limit));
                    // Role-based scope
                    const scope = opts.scope || getTicketScopeParams(getSessionUser());
                    if (scope.scope)  params.set('scope',  scope.scope);
                    if (scope.userId) params.set('userId', scope.userId);
                    if (scope.deptId) params.set('deptId', scope.deptId);
                    const res = await authFetch(`${HRMS_API}/tickets?${params}`);
                    if (!res.ok) throw new Error('Failed to fetch tickets');
                    return res.json();
                },
                getById: async (id) => {
                    const res = await authFetch(`${HRMS_API}/tickets/${id}`);
                    if (!res.ok) throw new Error('Ticket not found');
                    return res.json();
                },
                create: async (data) => {
                    const res = await authFetch(`${HRMS_API}/tickets`, {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to create ticket'); }
                    return res.json();
                },
                update: async (id, data) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ ...data, actorId: u?.id })
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to update ticket'); }
                    return res.json();
                },
                setApprovers: async (id, approverIds) => {
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/approvers`, {
                        method: 'POST',
                        body: JSON.stringify({ approver_ids: approverIds })
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to update approvers'); }
                    return res.json();
                },
                delete: async (id, justification) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}`, {
                        method: 'DELETE',
                        body: JSON.stringify({ actorId: u?.id, justification })
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to delete ticket'); }
                    return res.json();
                },
                requestExtension: async (id, newDueDate, note) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/request-extension`, {
                        method: 'POST',
                        body: JSON.stringify({ newDueDate, note, actorId: u?.id })
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to request extension'); }
                    return res.json();
                },
                respondExtension: async (id, action, note) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/respond-extension`, {
                        method: 'POST',
                        body: JSON.stringify({ action, note, actorId: u?.id })
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to respond to extension'); }
                    return res.json();
                },
                escalate: async (id, escalateToUserId, reason) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/escalate`, {
                        method: 'POST',
                        body: JSON.stringify({ escalateToUserId, reason, actorId: u?.id })
                    });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to escalate'); }
                    return res.json();
                },
                getEscalations: async (id) => {
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/escalations`);
                    if (!res.ok) throw new Error('Failed to fetch escalations');
                    return res.json();
                },
                addAttachments: async (id, attachments) => {
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/attachments`, {
                        method: 'POST',
                        body: JSON.stringify({ attachments })
                    });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to upload attachment'); }
                    return res.json();
                },
                complete: async (id, resolutionNote) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/complete`, {
                        method: 'POST',
                        body: JSON.stringify({ actorId: u?.id, resolutionNote })
                    });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to mark complete'); }
                    return res.json();
                },
                approve: async (id, acceptanceNote) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/approve`, {
                        method: 'POST',
                        body: JSON.stringify({ actorId: u?.id, acceptanceNote: acceptanceNote || '' })
                    });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to approve'); }
                    return res.json();
                },
                reject: async (id, justification) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/reject`, {
                        method: 'POST',
                        body: JSON.stringify({ justification, actorId: u?.id })
                    });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to reject'); }
                    return res.json();
                },
                reopen: async (id, justification) => {
                    const u = getSessionUser();
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/reopen`, {
                        method: 'POST',
                        body: JSON.stringify({ justification, actorId: u?.id })
                    });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to reopen ticket'); }
                    return res.json();
                },
                close: async (id) => {
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/close`, { method: 'POST' });
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to close ticket'); }
                    return res.json();
                },
                log: async (id) => {
                    const res = await authFetch(`${HRMS_API}/tickets/${id}/log`);
                    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to fetch ticket log'); }
                    return res.json();
                },
            },
            users: {
                getAll: async () => {
                    const res = await authFetch(`${API_BASE_URL}/users`);
                    if (!res.ok) throw new Error('Failed to fetch users');
                    return res.json();
                },
                me: {
                    get: async () => {
                        const res = await authFetch(`${API_BASE_URL}/users/me`);
                        if (!res.ok) throw new Error('Failed to fetch profile');
                        return res.json();
                    },
                    update: async (data) => {
                        const res = await authFetch(`${API_BASE_URL}/users/me`, {
                            method: 'PATCH',
                            body: JSON.stringify(data)
                        });
                        if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || 'Failed to update profile'); }
                        return res.json();
                    }
                }
            }
        };

        // ── Dark Mode Context (consumed by all page components) ────────────────
        const DarkModeContext = React.createContext(false);
        const useDark = () => React.useContext(DarkModeContext);

        // ── Global Ticket Cache — fetch once, share across all pages ─────────
        // Pages seed their local state from this cache so they render instantly
        // without waiting for their own API call. Cache auto-refreshes every 60s.
        const TicketCacheContext = React.createContext({ tickets: [], ready: false, refresh: () => {} });
        const useTicketCache = () => React.useContext(TicketCacheContext);

        // ── useDebounce — delays state updates until typing pauses ───────────────
        function useDebounce(value, delay) {
            const [debounced, setDebounced] = React.useState(value);
            React.useEffect(() => {
                const t = setTimeout(() => setDebounced(value), delay);
                return () => clearTimeout(t);
            }, [value, delay]);
            return debounced;
        }

        // ── Shared Loading Components ────────────────────────────────────────────
        // Spinning Yahweh Care logo mark — the real brand icon, used everywhere the app is loading
        function YCLoader({ size = 36 }) {
            return (
                <div className="yc-spin" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',animation:'spin 0.9s linear infinite',width:size,height:size,flexShrink:0,willChange:'transform'}}>
                    <img src="/apple-touch-icon.png" alt="" style={{width:size,height:size,objectFit:'contain',display:'block'}}/>
                </div>
            );
        }

        // Full-page loading screen — white/light branded, consistent across the app
        function LoadingScreen({ message = 'Loading…' }) {
            return (
                <div style={{
                    minHeight:'100vh', width:'100%', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    background:'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                    fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
                    position:'relative', overflow:'hidden',
                }}>
                    {/* Purple brand glow orbs */}
                    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:'-20%',left:'-10%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle, rgba(109,39,115,0.12) 0%, transparent 70%)'}}/>
                        <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle, rgba(131,47,138,0.10) 0%, transparent 70%)'}}/>
                    </div>
                    <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <YCLoader size={56} />
                        <p style={{marginTop:16,fontSize:14,color:'#94A3B8',fontWeight:500,letterSpacing:'0.01em'}}>{message}</p>
                    </div>
                </div>
            );
        }

        // Inline section loader — skeleton shimmer rows for instant feel
        function SectionLoader({ message = 'Loading…', size = 32 }) {
            return (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:'40px 24px'}}>
                    <YCLoader size={size} />
                    <p style={{fontSize:13,color:'#94A3B8',margin:0,fontWeight:500}}>{message}</p>
                    {/* Shimmer skeleton rows */}
                    <div style={{width:'100%',maxWidth:320,display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                        <div className="yc-shimmer" style={{height:10,width:'85%'}}/>
                        <div className="yc-shimmer" style={{height:10,width:'65%'}}/>
                        <div className="yc-shimmer" style={{height:10,width:'75%'}}/>
                    </div>
                </div>
            );
        }

        // Navigation Component
        // ── Top Header Bar ──────────────────────────────────────────────────────
        const TopBar = React.memo(function TopBar({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode, currentUser, currentPage, onSignOut, setCurrentPage }) {
            const [userMenuOpen, setUserMenuOpen] = React.useState(false);
            const [appToast,      setAppToast]      = React.useState('');
            const showToast = (msg) => { setAppToast(msg); setTimeout(() => setAppToast(''), 3500); };

            // ── Push notification subscription state ──────────────────────────────
            // 'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported'
            const [pushStatus, setPushStatus] = React.useState('idle');

            const urlBase64ToUint8Array = (b64) => {
                const pad = '='.repeat((4 - b64.length % 4) % 4);
                const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
                const raw = atob(base64);
                const arr = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
                return arr;
            };

            // Check existing subscription state on mount
            React.useEffect(() => {
                if (!currentUser) return;
                if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                    setPushStatus('unsupported'); return;
                }
                if (Notification.permission === 'denied') {
                    setPushStatus('denied'); return;
                }
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(reg => {
                    reg.pushManager.getSubscription().then(sub => {
                        setPushStatus(sub ? 'subscribed' : 'idle');
                    });
                }).catch(() => setPushStatus('idle'));
            }, [currentUser]);

            // Handle SW_NAVIGATE messages from push notification clicks
            React.useEffect(() => {
                if (!currentUser) return;
                const handler = (e) => {
                    if (e.data?.type === 'SW_NAVIGATE' && e.data?.hash) {
                        window.location.hash = e.data.hash;
                    }
                };
                navigator.serviceWorker?.addEventListener('message', handler);
                return () => navigator.serviceWorker?.removeEventListener('message', handler);
            }, [currentUser]);

            const handlePushToggle = async () => {
                if (pushStatus === 'unsupported') return;
                if (pushStatus === 'denied') {
                    // Try to open site settings directly so user can reset the permission
                    showToast('Notifications blocked — click the lock icon in your browser address bar → Site settings → Notifications → Allow');
                    return;
                }
                if (pushStatus === 'loading') return;

                // If already subscribed — unsubscribe
                if (pushStatus === 'subscribed') {
                    try {
                        const reg = await navigator.serviceWorker.getRegistration('/');
                        const sub = reg ? await reg.pushManager.getSubscription() : null;
                        if (sub) {
                            await authFetch(`${HRMS_API}/push/unsubscribe`, {
                                method: 'POST', noRedirect: true,
                                body: JSON.stringify({ endpoint: sub.endpoint }),
                            }).catch(() => {});
                            await sub.unsubscribe();
                        }
                        setPushStatus('idle');
                        showToast('Push notifications disabled');
                    } catch { showToast('Could not disable push notifications'); }
                    return;
                }

                // Subscribe
                setPushStatus('loading');
                try {
                    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                    await navigator.serviceWorker.ready;

                    const keyRes = await fetch(`${HRMS_API}/push/vapid-public-key`);
                    if (!keyRes.ok) { setPushStatus('idle'); showToast('Push not configured on server'); return; }
                    const { publicKey } = await keyRes.json();
                    if (!publicKey) { setPushStatus('idle'); showToast('Push not configured on server'); return; }

                    const permission = await Notification.requestPermission();
                    if (permission === 'denied') { setPushStatus('denied'); showToast('Notifications blocked — allow in browser settings'); return; }
                    if (permission !== 'granted') { setPushStatus('idle'); return; }

                    const sub = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicKey),
                    });
                    const subJson = sub.toJSON();
                    const saveRes = await authFetch(`${HRMS_API}/push/subscribe`, {
                        method: 'POST', noRedirect: true,
                        body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys }),
                    });
                    if (saveRes.ok) {
                        setPushStatus('subscribed');
                        showToast('Push notifications enabled!');
                    } else {
                        setPushStatus('idle');
                        showToast('Failed to save subscription');
                    }
                } catch (e) {
                    setPushStatus('idle');
                    showToast('Could not enable push notifications');
                }
            };

            const displayName = currentUser?.name || 'User';
            const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
            const deptLabel   = currentUser?.isBootstrapAdmin
                ? 'System Administrator'
                : (currentUser?.department_name || currentUser?.dept || '');

            const pageLabels = {
                'dashboard':'Dashboard','create-ticket':'Create Ticket','tickets':'Tickets',
                'calendar':'Calendar','analytics':'Analytics','org-chart':'Org Chart',
                'staff-performance':'Staff Performance','team-comparison':'Team Comparison',
                'staff-management':'Staff Management','scheduled-reports':'Scheduled Reports',
                'ticket-log':'Ticket Log','email-config':'Email Config','settings':'My Profile',
                'vehicle-management':'Vehicle Management','ex-staff':'Ex-Staff','activity-log':'Activity Log',
            };

            React.useEffect(() => {
                if (!userMenuOpen) return;
                const close = () => setUserMenuOpen(false);
                document.addEventListener('click', close);
                return () => document.removeEventListener('click', close);
            }, [userMenuOpen]);

            const bg      = darkMode ? 'linear-gradient(90deg,#04080f 0%,#060d1e 100%)' : '#FFFFFF';
            const border  = darkMode ? 'rgba(109,39,115,0.14)' : '#E2E8F2';
            const textC   = darkMode ? '#f0f4ff'  : '#0F172A';
            const subC    = darkMode ? '#8fa4cc'  : '#64748B';
            const iconBg  = darkMode ? 'rgba(109,39,115,0.12)'  : '#F5F7FF';

            const iconBtn = (extra={}) => ({
                width:36, height:36, borderRadius:8, background:iconBg,
                border:`1px solid ${border}`, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, flexShrink:0,
                boxShadow: darkMode ? '0 0 8px rgba(109,39,115,0.08)' : 'none',
                ...extra,
            });

            return (
                <div style={{position:'relative'}}>
                {/* TopBar toast — for test notification feedback */}
                {appToast && (
                    <div style={{position:'fixed',top:68,left:'50%',transform:'translateX(-50%)',zIndex:9999,background:'#1E1B4B',color:'#fff',padding:'10px 20px',borderRadius:10,fontSize:13,fontWeight:600,boxShadow:'0 4px 16px rgba(0,0,0,0.25)',pointerEvents:'none',whiteSpace:'nowrap'}}>
                        {appToast}
                    </div>
                )}
                <div style={{
                    height:56, background:bg,
                    borderBottom:`1px solid ${border}`,
                    boxShadow: darkMode ? '0 4px 32px rgba(0,0,0,0.7), 0 1px 0 rgba(109,39,115,0.14), inset 0 -1px 0 rgba(109,39,115,0.08)' : '0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0  0 0 1px rgba(15,23,42,0.03)',
                    display:'flex', alignItems:'center', padding:'0 20px', gap:10,
                    flexShrink:0, position:'relative', zIndex:30,
                }}>
                    {/* Sidebar toggle */}
                    <button onClick={() => setSidebarOpen(o => !o)} style={iconBtn()} title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
                        {sidebarOpen
                            ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke={textC} strokeWidth="2" strokeLinecap="round"/></svg>
                            : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14M2 9h14M2 14h14" stroke={textC} strokeWidth="2" strokeLinecap="round"/></svg>
                        }
                    </button>

                    {/* Page title — span wrapper keeps flex:1 on mobile even when text hidden */}
                    <span style={{flex:1, minWidth:0}}>
                        <span className="yc-topbar-title" style={{fontSize:15, fontWeight:700, color:textC, letterSpacing:'-0.01em'}}>
                            {pageLabels[currentPage] || 'Dashboard'}
                        </span>
                    </span>

                    {/* Push notification bell */}
                    {pushStatus !== 'unsupported' && (
                        <button
                            onClick={handlePushToggle}
                            title={
                                pushStatus === 'subscribed' ? 'Push notifications on — click to disable'
                                : pushStatus === 'denied'   ? 'Notifications blocked in browser'
                                : pushStatus === 'loading'  ? 'Enabling…'
                                : 'Enable push notifications'
                            }
                            style={iconBtn({
                                position: 'relative',
                                background: pushStatus === 'subscribed'
                                    ? (darkMode ? 'rgba(109,39,115,0.25)' : '#F6ECF4')
                                    : pushStatus === 'denied'
                                    ? (darkMode ? 'rgba(239,68,68,0.15)' : '#FEF2F2')
                                    : pushStatus === 'idle'
                                    ? (darkMode ? 'rgba(109,39,115,0.10)' : '#F5F3FF')
                                    : iconBg,
                                border: pushStatus === 'subscribed'
                                    ? `1px solid ${darkMode ? 'rgba(109,39,115,0.5)' : '#C77DB8'}`
                                    : pushStatus === 'denied'
                                    ? `1px solid ${darkMode ? 'rgba(239,68,68,0.4)' : '#FECACA'}`
                                    : pushStatus === 'idle'
                                    ? `1px solid ${darkMode ? 'rgba(109,39,115,0.25)' : '#DDD6FE'}`
                                    : `1px solid ${border}`,
                                opacity: pushStatus === 'loading' ? 0.6 : 1,
                                cursor: pushStatus === 'loading' ? 'default' : 'pointer',
                            })}
                        >
                            {pushStatus === 'subscribed' ? (
                                /* Bell with dot — enabled */
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={darkMode ? '#C77DB8' : '#6D2773'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="18" cy="5" r="4" fill="#22C55E" stroke={darkMode ? '#060d1e' : '#fff'} strokeWidth="1.5"/>
                                </svg>
                            ) : pushStatus === 'denied' ? (
                                /* Bell-off — blocked */
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0M18.63 13A17.9 17.9 0 0 1 18 8M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14M18 8a6 6 0 0 0-9.33-5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 2l20 20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            ) : pushStatus === 'loading' ? (
                                /* Spinner */
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="yc-spin" style={{animation:'spin 0.65s linear infinite'}}>
                                    <circle cx="12" cy="12" r="10" stroke={darkMode?'#C77DB8':'#833089'} strokeWidth="2" strokeDasharray="40 20" strokeLinecap="round"/>
                                </svg>
                            ) : (
                                /* Bell — idle (purple tint to invite click) */
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={darkMode ? '#C77DB8' : '#833089'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                    )}

                    {/* Dark / Light toggle */}
                    <button onClick={() => setDarkMode(d => !d)} style={iconBtn()} title={darkMode ? 'Light mode' : 'Dark mode'}>
                        {darkMode
                            ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="#FCD34D" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/></svg>
                            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={textC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                    </button>

                    {/* User menu */}
                    <div style={{position:'relative'}}>
                        <button onClick={e => { e.stopPropagation(); setUserMenuOpen(o => !o); }}
                            style={{
                                height:36, borderRadius:8, background: userMenuOpen ? '#F6ECF4' : iconBg,
                                border:`1px solid ${userMenuOpen ? '#C77DB8' : border}`,
                                cursor:'pointer', display:'flex', alignItems:'center', gap:8, padding:'0 10px',
                            }}>
                            {currentUser?.profile_photo_url ? (
                                <img src={currentUser.profile_photo_url} alt="" style={{width:26,height:26,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                            ) : (
                                <div style={{width:26,height:26,borderRadius:'50%',background:'#F97316',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:11,flexShrink:0}}>
                                    {initials}
                                </div>
                            )}
                            <span className="yc-user-label" style={{fontSize:13,fontWeight:600,color:textC,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                {displayName}
                            </span>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.15s'}}>
                                <path d="M2 3.5l3 3 3-3" stroke={subC} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {userMenuOpen && (
                            <div onClick={e => e.stopPropagation()} style={{
                                position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:220,
                                background: darkMode ? '#0F172A' : '#FFFFFF',
                                borderRadius:14,
                                boxShadow: darkMode
                                    ? '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(109,39,115,0.18)'
                                    : '0 8px 32px rgba(15,23,42,0.14), 0 0 0 1px rgba(15,23,42,0.06)',
                                border: `1px solid ${darkMode ? 'rgba(109,39,115,0.18)' : '#E2E8F0'}`,
                                zIndex:50, overflow:'hidden',
                            }}>
                                <div style={{padding:'12px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:10}}>
                                    {currentUser?.profile_photo_url ? (
                                        <img src={currentUser.profile_photo_url} alt="" style={{width:34,height:34,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                                    ) : (
                                        <div style={{width:34,height:34,borderRadius:'50%',background:'#F97316',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,flexShrink:0}}>
                                            {initials}
                                        </div>
                                    )}
                                    <div style={{flex:1,minWidth:0}}>
                                        <p style={{fontSize:13, fontWeight:700, color:textC, margin:0}}>{displayName}</p>
                                        <p style={{fontSize:11, color:subC, margin:'1px 0 3px'}}>{deptLabel}</p>
                                        {(()=>{
                                            const rb = getRoleBadgeInfo(currentUser);
                                            if (!rb) return null;
                                            return (
                                                <div style={{display:'flex',flexDirection:'column',gap:1}}>
                                                    <span style={{display:'inline-block',fontSize:'9px',fontWeight:700,padding:'2px 8px',borderRadius:10,background:rb.bg,color:rb.color,border:`1px solid ${rb.border}`}}>{rb.label}</span>
                                                    <span style={{fontSize:'9px',color:subC,fontStyle:'italic'}}>{rb.desc}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <button onClick={() => { setUserMenuOpen(false); setCurrentPage('settings'); }}
                                    style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:textC}}>
                                    <Icon name="settings" size={15} />
                                    <span style={{fontWeight:500}}>Settings</span>
                                </button>
                                <div style={{height:1, background:border, margin:'0 12px'}}/>
                                <button onClick={() => { setUserMenuOpen(false); onSignOut(); }}
                                    style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#DC2626',fontWeight:600}}>
                                    <Icon name='log-out' size={15} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            );
        });

        // ── Sidebar Navigation ───────────────────────────────────────────────────
        const Navigation = React.memo(function Navigation({ currentPage, setCurrentPage, onSignOut, currentUser, darkMode }) {
            const [profileOpen, setProfileOpen] = React.useState(false);
            const displayName = currentUser?.name || 'User';
            const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const deptLabel = currentUser?.isBootstrapAdmin
                ? 'System Administrator'
                : (currentUser?.dept || currentUser?.department_name || currentUser?.employment_type || '');

            const allowedPages = getAccessiblePages(currentUser);
            const pages = [
                { id: 'dashboard',         label: 'Dashboard',         icon: 'dashboard' },
                { id: 'create-ticket',     label: 'Create Ticket',     icon: 'plus-circle' },
                { id: 'tickets',           label: 'Tickets',           icon: 'clipboard-list' },
                { id: 'calendar',          label: 'Calendar',          icon: 'calendar' },
                { id: 'analytics',         label: 'Analytics',         icon: 'trending-up' },
                { id: 'org-chart',         label: 'Org Chart',         icon: 'building-2' },
                { id: 'staff-performance', label: 'Staff Performance', icon: 'star' },
                { id: 'team-comparison',   label: 'Team Comparison',   icon: 'refresh-cw' },
                { id: 'staff-management',  label: 'Staff Management',  icon: 'briefcase' },
                { id: 'ticket-log',        label: 'Ticket Log',        icon: 'scroll-text' },
                { id: 'vehicle-management',label: 'Vehicle Management',icon: 'truck' },
                { id: 'scheduled-reports', label: 'Scheduled Reports', icon: 'send' },
                { id: 'email-config',      label: 'Email Config',       icon: 'mail-cog' },
                { id: 'ex-staff',          label: 'Ex-Staff',          icon: 'users-minus' },
                { id: 'activity-log',      label: 'Activity Log',      icon: 'activity' },
            ].filter(p => allowedPages.includes(p.id));

            // Close dropdown when clicking outside
            React.useEffect(() => {
                if (!profileOpen) return;
                const close = () => setProfileOpen(false);
                document.addEventListener('click', close);
                return () => document.removeEventListener('click', close);
            }, [profileOpen]);

            const handleSettings = () => {
                setProfileOpen(false);
                setCurrentPage('settings');
            };

            const handleSignOut = () => {
                setProfileOpen(false);
                onSignOut();
            };

            const sidebarBg     = darkMode ? 'linear-gradient(180deg,#060d1e 0%,#030913 100%)' : '#FFFFFF';
            const sidebarBorder = darkMode ? 'rgba(109,39,115,0.14)' : '#E2E8F2';
            const sidebarText   = darkMode ? '#8fa4cc' : '#475569';
            const logoText      = darkMode ? '#d0d9ff' : '#0F172A';
            const logoSub       = darkMode ? '#4a607f' : '#94A3B8';

            return (
                <aside style={{width:256, background:sidebarBg, borderRight:`1px solid ${sidebarBorder}`, display:'flex', flexDirection:'column', height:'100vh', flexShrink:0, boxShadow: darkMode ? '4px 0 40px rgba(0,0,0,0.75), 1px 0 0 rgba(109,39,115,0.10)' : '2px 0 12px rgba(15,23,42,0.06), 1px 0 0 #E2E8F2'}}>
                    {/* Logo — fixed — click to return to Dashboard */}
                    <div style={{padding:'20px 16px 12px', flexShrink:0, cursor:'pointer'}} onClick={() => setCurrentPage('dashboard')} title="Go to Dashboard">
                        <img src="/logo.png" alt="Yahweh Care" style={{width:'100%', maxWidth:190, height:'auto', display:'block',
                            filter: darkMode ? 'drop-shadow(0 0 20px rgba(199,125,184,0.25))' : 'none'
                        }}/>
                    </div>

                    {/* Nav — scrolls independently */}
                    <nav style={{flex:1, overflowY:'auto', padding:'8px 12px', display:'flex', flexDirection:'column', gap:2}}>
                        {pages.map((page) => {
                            const active = currentPage === page.id;
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => setCurrentPage(page.id)}
                                    style={{
                                        width:'100%', textAlign:'left', padding:'9px 14px',
                                        borderRadius:8, border:'none', cursor:'pointer',
                                        display:'flex', alignItems:'center', gap:10,
                                        background: active
                                            ? (darkMode ? 'linear-gradient(90deg,rgba(109,39,115,0.28) 0%,rgba(109,39,115,0.04) 100%)' : '#6D2773')
                                            : 'transparent',
                                        borderLeft: active && darkMode ? '3px solid rgba(199,125,184,0.9)' : '3px solid transparent',
                                        boxShadow: active && darkMode ? '0 2px 20px rgba(109,39,115,0.28), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
                                        color: active ? (darkMode ? '#d0d9ff' : '#FFFFFF') : sidebarText,
                                        fontWeight: active ? 700 : 400,
                                        fontSize:13,
                                        transition:'all 0.18s',
                                    }}
                                    onMouseEnter={e => {
                                        if(!active) e.currentTarget.style.background = darkMode
                                            ? 'rgba(109,39,115,0.08)'
                                            : '#F3F4F6';
                                    }}
                                    onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Icon name={page.icon} size={16} />
                                    <span>{page.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Profile — fixed at bottom */}
                    <div style={{flexShrink:0, borderTop:`1px solid ${sidebarBorder}`, padding:'10px 12px', position:'relative'}}>
                        {profileOpen && (
                            <div onClick={e => e.stopPropagation()} style={{
                                position:'absolute', bottom:'100%', left:12, right:12, marginBottom:6,
                                background: darkMode ? '#0F172A' : '#FFFFFF',
                                borderRadius:12,
                                boxShadow: darkMode
                                    ? '0 -8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(109,39,115,0.18)'
                                    : '0 -4px 24px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.06)',
                                border: `1px solid ${darkMode ? 'rgba(109,39,115,0.18)' : '#E2E8F0'}`,
                                overflow:'hidden', zIndex:50,
                            }}>
                                <button onClick={handleSettings} style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:sidebarText}}>
                                    <Icon name="settings" size={15} />
                                    <span style={{fontWeight:500}}>Settings</span>
                                </button>
                                <div style={{height:1, background:sidebarBorder, margin:'0 12px'}}/>
                                <button onClick={handleSignOut} style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#DC2626',fontWeight:600}}>
                                    <Icon name='log-out' size={15} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); setProfileOpen(o => !o); }}
                            style={{
                                width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 11px',
                                borderRadius:10, cursor:'pointer',
                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                                boxShadow: darkMode ? 'none' : '0 1px 2px rgba(15,23,42,0.04)',
                                transition:'border-color 0.15s, background 0.15s',
                            }}>
                            {currentUser?.profile_photo_url ? (
                                <img src={currentUser.profile_photo_url} alt="" style={{width:34,height:34,borderRadius:9,objectFit:'cover',flexShrink:0}}/>
                            ) : (
                                <div style={{width:34,height:34,borderRadius:9,background:'#6D2773',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:12,flexShrink:0,letterSpacing:'0.02em'}}>
                                    {initials}
                                </div>
                            )}
                            <div style={{flex:1, minWidth:0, textAlign:'left'}}>
                                <p style={{fontSize:13,fontWeight:700,color:logoText,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:0,letterSpacing:'-0.01em'}}>{displayName}</p>
                                <p style={{fontSize:11,color:logoSub,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:'1px 0 0',fontWeight:500}}>{deptLabel}</p>
                                {(()=>{
                                    const rb = getRoleBadgeInfo(currentUser);
                                    if (!rb) return null;
                                    const label = rb.label;
                                    return (
                                        <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:'10px',fontWeight:700,padding:'2px 8px 2px 6px',borderRadius:20,background:darkMode?'rgba(255,255,255,0.06)':'#F8FAFC',color:darkMode?'#c7d0e8':'#334155',border:`1px solid ${darkMode?'rgba(255,255,255,0.08)':'#E2E8F0'}`,marginTop:5,letterSpacing:'0.02em'}}>
                                            <span style={{width:5,height:5,borderRadius:'50%',background:rb.dot,flexShrink:0}}/>
                                            {label}
                                        </span>
                                    );
                                })()}
                            </div>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,transform:profileOpen?'rotate(0deg)':'rotate(180deg)',transition:'transform 0.2s'}}>
                                <path d="M2 4l4 4 4-4" stroke={darkMode?'#64748B':'#94A3B8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </aside>
            );
        }); // end Navigation React.memo

        // ── Login Page (initial / not-yet-authenticated) ──────────────────────────
        function LoginPage({ onSignIn }) {
            const [hovered,    setHovered]    = React.useState(false);
            const [signingIn,  setSigningIn]  = React.useState(false);

            const handleClick = () => {
                if (signingIn) return;
                setSigningIn(true);
                onSignIn();
            };

            return (
                <div style={{
                    minHeight:'100vh', width:'100%', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    background:'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                    fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
                    position:'relative', overflow:'hidden',
                }}>
                    {/* Background glows */}
                    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:'-20%',left:'-10%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle, rgba(109,39,115,0.12) 0%, transparent 70%)'}}/>
                        <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle, rgba(131,47,138,0.10) 0%, transparent 70%)'}}/>
                    </div>

                    {/* Card */}
                    <div style={{
                        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)',
                        border:'1px solid rgba(255,255,255,0.10)', borderRadius:24,
                        padding:'48px 44px', textAlign:'center', maxWidth:420, width:'90%',
                        boxShadow:'0 32px 64px rgba(0,0,0,0.4)', position:'relative', zIndex:1,
                    }}>
                        {/* Logo */}
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:28}}>
                            <img src="/logo.png" alt="Yahweh Care" style={{height:48, width:'auto', display:'block'}}/>
                        </div>

                        <div style={{height:1,background:'rgba(255,255,255,0.08)',margin:'0 0 28px'}}/>

                        <h2 style={{fontSize:22,fontWeight:800,color:'#F8FAFC',margin:'0 0 8px',letterSpacing:'-0.02em'}}>
                            Welcome back
                        </h2>
                        <p style={{fontSize:13,color:'#94A3B8',margin:'0 0 32px',lineHeight:1.7}}>
                            Sign in to access the Yahweh Care<br/>Ticket Management System.
                        </p>

                        <button
                            onClick={handleClick}
                            disabled={signingIn}
                            onMouseEnter={() => !signingIn && setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            style={{
                                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                                padding:'13px 0', borderRadius:12, border:'none',
                                cursor: signingIn ? 'default' : 'pointer',
                                background: signingIn ? '#5D2162' : hovered ? '#5D2162' : '#6D2773',
                                color:'white', fontSize:14, fontWeight:700,
                                boxShadow: signingIn ? '0 4px 14px rgba(109,39,115,0.25)' : hovered ? '0 4px 14px rgba(109,39,115,0.4)' : '0 2px 8px rgba(109,39,115,0.3)',
                                transition:'all 0.2s',
                                opacity: signingIn ? 0.85 : 1,
                            }}
                        >
                            {signingIn ? (
                                <>
                                    <div style={{
                                        width:18, height:18, borderRadius:'50%', flexShrink:0,
                                        border:'2.5px solid rgba(255,255,255,0.35)',
                                        borderTopColor:'#fff',
                                        animation:'spin 0.75s linear infinite',
                                    }}/>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 21 21" fill="none" style={{flexShrink:0}}>
                                        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                                        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                                        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                                        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                                    </svg>
                                    Sign in with Microsoft
                                </>
                            )}
                        </button>

                        {signingIn && (
                            <p style={{fontSize:12,color:'#6D2773',margin:'14px 0 0',fontWeight:600,letterSpacing:'0.01em'}}>
                                Redirecting to Microsoft…
                            </p>
                        )}

                        <p style={{fontSize:11,color:'#475569',margin: signingIn ? '8px 0 0' : '20px 0 0',lineHeight:1.5}}>
                            Secure login via Microsoft Entra ID.<br/>Contact your administrator if you need access.
                        </p>
                    </div>

                    <p style={{position:'relative',zIndex:1,marginTop:24,fontSize:11,color:'rgba(255,255,255,0.2)',letterSpacing:'0.05em'}}>
                        © {new Date().getFullYear()} Yahweh Care — Ticket Management System
                    </p>
                </div>
            );
        }

        // ── Dedicated Logout Page (/#logout) ─────────────────────────────────────
        function LogoutPage() {
            const handleLogin = () => { window.location.hash = ''; window.MicrosoftAuth.signIn(); };

            return (
                <div style={{
                    minHeight:'100vh', width:'100%', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    background:'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                    fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
                    position:'relative', overflow:'hidden',
                }}>
                    {/* Background glows */}
                    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:'-20%',left:'-10%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle, rgba(109,39,115,0.12) 0%, transparent 70%)'}}/>
                        <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle, rgba(131,47,138,0.10) 0%, transparent 70%)'}}/>
                    </div>

                    {/* Card */}
                    <div style={{
                        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)',
                        border:'1px solid rgba(255,255,255,0.10)', borderRadius:24,
                        padding:'48px 44px', textAlign:'center', maxWidth:420, width:'90%',
                        boxShadow:'0 32px 64px rgba(0,0,0,0.4)', position:'relative', zIndex:1,
                    }}>
                        {/* Logo */}
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:28}}>
                            <img src="/logo.png" alt="Yahweh Care" style={{height:48, width:'auto', display:'block'}}/>
                        </div>

                        <div style={{height:1,background:'rgba(255,255,255,0.08)',margin:'0 0 28px'}}/>

                        {/* Checkmark icon */}
                        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>

                        <h2 style={{fontSize:22,fontWeight:800,color:'#F8FAFC',margin:'0 0 10px',letterSpacing:'-0.02em'}}>
                            You've been logged out
                        </h2>
                        <p style={{fontSize:13,color:'#94A3B8',margin:'0 0 32px',lineHeight:1.7}}>
                            Your Yahweh Care session has ended securely.<br/>
                            Your Microsoft account remains active.
                        </p>

                        {/* Login link */}
                        <p style={{margin:0,fontSize:14,color:'#64748B'}}>
                            <a
                                href="#"
                                onClick={(e)=>{ e.preventDefault(); handleLogin(); }}
                                style={{color:'#C77DB8',textDecoration:'none',fontWeight:600}}
                                onMouseEnter={e=>e.target.style.textDecoration='underline'}
                                onMouseLeave={e=>e.target.style.textDecoration='none'}
                            >
                                Click here to go to login page
                            </a>
                        </p>
                    </div>

                    <p style={{position:'relative',zIndex:1,marginTop:24,fontSize:11,color:'rgba(255,255,255,0.2)',letterSpacing:'0.05em'}}>
                        © {new Date().getFullYear()} Yahweh Care — Ticket Management System
                    </p>
                </div>
            );
        }

        // ── Branded Signed-Out / Session-Expired Screen ───────────────────────────
        function SignedOutScreen({ onSignBackIn, authError }) {
            const [hovered,   setHovered]   = React.useState(false);
            const [signingIn, setSigningIn] = React.useState(false);

            const handleClick = () => {
                if (signingIn) return;
                setSigningIn(true);
                onSignBackIn();
            };

            return (
                <div style={{
                    minHeight:'100vh', width:'100%', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    background:'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                    fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
                    position:'relative', overflow:'hidden',
                }}>
                    {/* Background decoration */}
                    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:'-20%',left:'-10%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle, rgba(109,39,115,0.12) 0%, transparent 70%)'}}/>
                        <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle, rgba(131,47,138,0.10) 0%, transparent 70%)'}}/>
                    </div>

                    {/* Card */}
                    <div style={{
                        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)',
                        border:'1px solid rgba(255,255,255,0.10)', borderRadius:24,
                        padding:'48px 44px', textAlign:'center', maxWidth:420, width:'90%',
                        boxShadow:'0 32px 64px rgba(0,0,0,0.4)', position:'relative', zIndex:1,
                    }}>

                        {/* Logo mark */}
                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:28}}>
                            <img src="/logo.png" alt="Yahweh Care" style={{height:48, width:'auto', display:'block'}}/>
                        </div>

                        {/* Divider */}
                        <div style={{height:1, background:'rgba(255,255,255,0.08)', margin:'0 0 28px'}}/>

                        {/* Logout icon */}
                        <div style={{
                            width:64, height:64, borderRadius:'50%',
                            background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            margin:'0 auto 20px',
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>

                        <h2 style={{fontSize:22, fontWeight:800, color:'#F8FAFC', margin:'0 0 8px', letterSpacing:'-0.02em'}}>
                            You've been signed out
                        </h2>
                        <p style={{fontSize:13, color:'#94A3B8', margin:'0 0 28px', lineHeight:1.6}}>
                            Your Yahweh Care session has ended securely.<br/>Your Microsoft account remains active.
                        </p>

                        {/* Error banner */}
                        {authError && (
                            <div style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:12, color:'#FCA5A5', textAlign:'left', display:'flex', alignItems:'center', gap:8}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {authError}
                            </div>
                        )}

                        {/* Sign in button */}
                        <button
                            onClick={handleClick}
                            disabled={signingIn}
                            onMouseEnter={() => !signingIn && setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            style={{
                                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                                padding:'13px 0', borderRadius:12, border:'none',
                                cursor: signingIn ? 'default' : 'pointer',
                                background: signingIn ? '#5D2162' : hovered ? '#5D2162' : '#6D2773',
                                color:'white', fontSize:14, fontWeight:700,
                                boxShadow: signingIn ? '0 4px 14px rgba(109,39,115,0.25)' : hovered ? '0 4px 14px rgba(109,39,115,0.4)' : '0 2px 8px rgba(109,39,115,0.3)',
                                transition:'all 0.2s',
                                opacity: signingIn ? 0.85 : 1,
                            }}
                        >
                            {signingIn ? (
                                <>
                                    <div style={{
                                        width:18, height:18, borderRadius:'50%', flexShrink:0,
                                        border:'2.5px solid rgba(255,255,255,0.35)',
                                        borderTopColor:'#fff',
                                        animation:'spin 0.75s linear infinite',
                                    }}/>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 21 21" fill="none" style={{flexShrink:0}}>
                                        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                                        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                                        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                                        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                                    </svg>
                                    Sign in with Microsoft
                                </>
                            )}
                        </button>

                        {signingIn && (
                            <p style={{fontSize:12, color:'#6D2773', margin:'14px 0 0', fontWeight:600, letterSpacing:'0.01em'}}>
                                Redirecting to Microsoft…
                            </p>
                        )}

                        {/* Footer note */}
                        <p style={{fontSize:11, color:'#475569', margin: signingIn ? '8px 0 0' : '20px 0 0', lineHeight:1.5}}>
                            Secure login via Microsoft Entra ID.<br/>Contact your administrator if you have trouble signing in.
                        </p>
                    </div>

                    {/* Bottom brand */}
                    <p style={{position:'relative', zIndex:1, marginTop:24, fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:'0.05em'}}>
                        © {new Date().getFullYear()} Yahweh Care — Ticket Management System
                    </p>
                </div>
            );
        }

        // ── InsightDrawer — professional slide-in insight panel ──────────────────
        function InsightDrawer({ data, onClose }) {
            const dm = useDark();
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            React.useEffect(() => {
                const fn = e => { if (e.key === 'Escape') onClose(); };
                document.addEventListener('keydown', fn);
                return () => document.removeEventListener('keydown', fn);
            }, []);
            if (!data) return null;
            const TS = {
                good: { bg: dm?'rgba(16,185,129,0.08)':'#F0FDF4', b: dm?'rgba(16,185,129,0.2)':'#BBF7D0' },
                warn: { bg: dm?'rgba(245,158,11,0.08)':'#FFFBEB', b: dm?'rgba(245,158,11,0.2)':'#FDE68A' },
                bad:  { bg: dm?'rgba(239,68,68,0.08)':'#FFF5F5',  b: dm?'rgba(239,68,68,0.2)':'#FCA5A5'  },
                info: { bg: dm?'rgba(109,39,115,0.08)':'#F5F3FF',  b: dm?'rgba(109,39,115,0.2)':'#DDD6FE' },
            };
            return (
                <div style={{position:'fixed',inset:0,zIndex:2000,display:'flex'}}>
                    <div style={{flex:1,background:'rgba(0,0,0,0.45)',cursor:'pointer',backdropFilter:'blur(2px)'}} onClick={onClose}/>
                    <div style={{width:'500px',maxWidth:'96vw',background:dm?'linear-gradient(180deg,rgba(6,12,32,0.99) 0%,rgba(3,7,20,1) 100%)':'#fff',overflowY:'auto',display:'flex',flexDirection:'column',boxShadow:dm?'-12px 0 64px rgba(0,0,0,0.85)':'-4px 0 40px rgba(15,23,42,0.14)',borderLeft:`1px solid ${borderC}`}}>
                        {/* Header */}
                        <div style={{padding:'20px 24px 16px',borderBottom:`1px solid ${borderC}`,position:'sticky',top:0,background:dm?'rgba(6,12,32,0.98)':'rgba(255,255,255,0.98)',zIndex:1,backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                <div style={{width:44,height:44,borderRadius:'12px',background:data.iconBg||(dm?'rgba(109,39,115,0.15)':'#F6ECF4'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name={data.icon} size={22} /></div>
                                <div>
                                    <h2 style={{fontSize:'16px',fontWeight:'800',color:textP,margin:'0 0 2px'}}>{data.title}</h2>
                                    <p style={{fontSize:'11px',color:textM,margin:0}}>{data.subtitle}</p>
                                </div>
                            </div>
                            <button onClick={onClose} style={{background:dm?'rgba(255,255,255,0.06)':'#F3F4F6',border:'none',borderRadius:'8px',width:'30px',height:'30px',cursor:'pointer',color:textM,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name='x' size={15} color={textM} /></button>
                        </div>
                        <div style={{padding:'20px 24px',flex:1}}>
                            {/* KPI chips */}
                            {data.metrics?.length > 0 && (
                                <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(data.metrics.length,3)},1fr)`,gap:'10px',marginBottom:'22px'}}>
                                    {data.metrics.map((m,i) => (
                                        <div key={i} style={{background:dm?'rgba(109,39,115,0.06)':'#F8FAFF',border:`1px solid ${borderC}`,borderRadius:'10px',padding:'14px 10px',textAlign:'center'}}>
                                            <div style={{fontSize:'21px',fontWeight:'800',color:m.color||textP,lineHeight:1}}>{m.value}</div>
                                            <div style={{fontSize:'10px',color:textM,marginTop:'4px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.05em'}}>{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Business Insights */}
                            {data.insights?.length > 0 && (
                                <div style={{marginBottom:'22px'}}>
                                    <p style={{fontSize:'10px',fontWeight:'700',color:dm?'#C77DB8':'#6D2773',textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 10px'}}><Icon name='zap' size={11} style={{marginRight:4}} />Business Insights</p>
                                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                        {data.insights.map((ins,i) => {
                                            const s = TS[ins.type]||TS.info;
                                            return (
                                                <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start',padding:'11px 13px',borderRadius:'9px',background:s.bg,border:`1px solid ${s.b}`}}>
                                                    <Icon name={ins.icon} size={15} style={{flexShrink:0,marginTop:'1px'}} />
                                                    <div>
                                                        {ins.title && <p style={{fontSize:'12px',fontWeight:'700',color:textP,margin:'0 0 2px'}}>{ins.title}</p>}
                                                        <p style={{fontSize:'12px',color:dm?'#c0cfec':'#374151',margin:0,lineHeight:'1.55'}}>{ins.text}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Breakdown bars */}
                            {data.breakdown?.length > 0 && (
                                <div style={{marginBottom:'22px'}}>
                                    <p style={{fontSize:'10px',fontWeight:'700',color:dm?'#C77DB8':'#6D2773',textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 10px'}}>{data.breakdownTitle||'Breakdown'}</p>
                                    <div style={{borderRadius:'10px',border:`1px solid ${borderC}`,overflow:'hidden'}}>
                                        {data.breakdown.map((row,i) => (
                                            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',background:i%2===0?(dm?'rgba(255,255,255,0.02)':'#fff'):(dm?'rgba(109,39,115,0.03)':'#FAFBFF'),borderBottom:i<data.breakdown.length-1?`1px solid ${borderC}`:'none'}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1,minWidth:0}}>
                                                    {row.dot && <span style={{width:'8px',height:'8px',borderRadius:'50%',background:row.dot,flexShrink:0,display:'inline-block'}}/>}
                                                    <span style={{fontSize:'12px',fontWeight:'600',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.label}</span>
                                                </div>
                                                <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
                                                    {row.bar !== undefined && (
                                                        <div style={{width:'70px',height:'5px',borderRadius:'3px',background:dm?'rgba(109,39,115,0.12)':'#E5E7EB'}}>
                                                            <div style={{height:'100%',width:`${Math.min(row.bar,100)}%`,background:row.dot||'#833089',borderRadius:'3px'}}/>
                                                        </div>
                                                    )}
                                                    <span style={{fontSize:'12px',fontWeight:'700',color:row.valueColor||textP,minWidth:'28px',textAlign:'right'}}>{row.value}</span>
                                                    {row.sub && <span style={{fontSize:'10px',color:textM,minWidth:'38px'}}>{row.sub}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Ticket rows */}
                            {data.rows?.length > 0 && (
                                <div>
                                    <p style={{fontSize:'10px',fontWeight:'700',color:dm?'#C77DB8':'#6D2773',textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 10px',display:'flex',alignItems:'center',gap:'6px'}}>
                                        {data.rowsTitle||'Tickets'}
                                        <span style={{background:dm?'rgba(109,39,115,0.2)':'#F6ECF4',color:dm?'#C77DB8':'#6D2773',padding:'1px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'700',letterSpacing:0}}>{data.rows.length}</span>
                                    </p>
                                    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                                        {data.rows.slice(0,20).map((row,i) => (
                                            <div key={i} style={{padding:'10px 12px',borderRadius:'8px',background:dm?'rgba(255,255,255,0.02)':'#F8FAFF',border:`1px solid ${borderC}`,display:'flex',alignItems:'flex-start',gap:'10px'}}>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <p style={{fontSize:'12px',fontWeight:'600',color:textP,margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.title}</p>
                                                    <p style={{fontSize:'11px',color:textM,margin:0}}>{row.sub}</p>
                                                </div>
                                                {row.badge && <span style={{flexShrink:0,fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'20px',background:row.badgeBg||(dm?'rgba(109,39,115,0.15)':'#F6ECF4'),color:row.badgeColor||(dm?'#C77DB8':'#6D2773'),whiteSpace:'nowrap'}}>{row.badge}</span>}
                                            </div>
                                        ))}
                                        {data.rows.length > 20 && <p style={{fontSize:'11px',color:textM,textAlign:'center',margin:'6px 0 0',padding:'8px',background:dm?'rgba(109,39,115,0.05)':'#F8FAFF',borderRadius:'8px'}}>+{data.rows.length-20} more not shown</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Dashboard Page
        const Dashboard = React.memo(function Dashboard() {
            const dm = useDark();
            const cache = useTicketCache();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const [tickets,       setTickets]       = React.useState(() => cache.tickets);
            const [staffCount,    setStaffCount]    = React.useState(0);
            const [recentActivity,setRecentActivity]= React.useState([]);
            const [loading,       setLoading]       = React.useState(() => !cache.ready);
            const statusCanvasRef   = React.useRef(null);
            const categoryCanvasRef = React.useRef(null);
            const statusChartRef    = React.useRef(null);
            const categoryChartRef  = React.useRef(null);

            // ── Fetch data ────────────────────────────────────────
            React.useEffect(() => {
                const su  = getSessionUser();
                const tsp = getTicketScopeParams(su);
                const uqp = getUserQueryParams(su);
                const sp  = getActivityScopeParams(su);
                const tp  = new URLSearchParams({ all:'1', limit:'500' });
                if (tsp.scope)  tp.set('scope',  tsp.scope);
                if (tsp.userId) tp.set('userId', String(tsp.userId));
                if (tsp.deptId) tp.set('deptId', String(tsp.deptId));

                // Fetch staff + activity in parallel; tickets come from cache (already shown)
                Promise.all([
                    cache.ready
                        ? Promise.resolve({ tickets: cache.tickets })
                        : fetch(`${HRMS_API}/tickets?${tp}`).then(r=>r.ok?r.json():{tickets:[]}),
                    fetch(`${HRMS_API}/users?status=active&limit=200${uqp}`).then(r=>r.ok?r.json():{users:[]}),
                    fetch(`${HRMS_API}/tickets/activity?limit=5${sp}`).then(r=>r.ok?r.json():{activity:[]}),
                ]).then(([td, ud, ad]) => {
                    setTickets(td.tickets || []);
                    setStaffCount((ud.users || []).length);
                    setRecentActivity(ad.activity || []);
                }).catch(()=>{}).finally(()=>setLoading(false));
            }, []);

            // ── Compute stats (memoized — only recalc when tickets change) ──────
            const stats = React.useMemo(() => {
                const now = new Date();
                let open=0, inProg=0, resolved=0, escalated=0, urgent=0, overdue=0, slaOk=0;
                const resTkts = [];
                for (const t of tickets) {
                    const s = t.status || '';
                    const p = (t.priorityLabel||t.priority||'').toLowerCase();
                    if (['new','assigned'].includes(s)) open++;
                    if (['in_progress','waiting','pending_approval'].includes(s)) inProg++;
                    if (['resolved','closed'].includes(s)) { resolved++; resTkts.push(t); }
                    if (t.isEscalated||t.escalated||s==='escalated') escalated++;
                    if (['critical','urgent'].includes(p)) urgent++;
                    if (!['resolved','closed'].includes(s)&&t.dueAt&&new Date(t.dueAt)<now) overdue++;
                }
                for (const t of resTkts) {
                    const due = t.dueAt||t.expectedCompletion; if(!due){slaOk++;continue;}
                    const fin = t.resolvedAt||t.updatedAt; if(!fin){slaOk++;continue;}
                    if(new Date(fin)<=new Date(due)) slaOk++;
                }
                const slaFailed = resTkts.length - slaOk;
                const slaTotalEval = resTkts.length + overdue;
                const slaPct = slaTotalEval>0 ? Math.round(slaOk/slaTotalEval*100) : 100;
                return { total:tickets.length, open, inProg, resolved, escalated, urgent, overdue, slaOk, slaFailed, slaTotalEval, slaPct };
            }, [tickets]);
            const { total, open, inProg, resolved, escalated, urgent, overdue, slaOk, slaFailed, slaTotalEval, slaPct } = stats;
            const r = 54, circ = 2*Math.PI*r;

            // ── Charts (rebuild when data changes) ────────────────
            React.useEffect(() => {
                if (!tickets.length) return;
                let raf1, raf2;
                loadChartJs().then(() => {
                // Status doughnut
                const statusGroups = { Open:open, 'In Progress':inProg, Resolved:resolved, Urgent:urgent, Other: Math.max(0,total-open-inProg-resolved-urgent) };
                const sLabels = Object.keys(statusGroups).filter(k=>statusGroups[k]>0);
                const sData   = sLabels.map(k=>statusGroups[k]);
                raf1 = requestAnimationFrame(()=>{
                    if (!statusCanvasRef.current) return;
                    if (statusChartRef.current) { try{statusChartRef.current.destroy();}catch(_){} }
                    statusChartRef.current = new Chart(statusCanvasRef.current, {
                        type: 'doughnut',
                        data: { labels: sLabels, datasets:[{ data:sData, backgroundColor:['#0EA5E9','#F59E0B','#10B981','#EF4444','#9CA3AF'], borderColor: dm ? '#091425' : '#fff', borderWidth:2 }] },
                        options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11} } } } }
                    });
                });

                // Category bar
                const catMap = {};
                tickets.forEach(t=>{ const c=t.categoryLabel||t.category||'Other'; catMap[c]=(catMap[c]||0)+1; });
                const catEntries = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
                raf2 = requestAnimationFrame(()=>{
                    if (!categoryCanvasRef.current) return;
                    if (categoryChartRef.current) { try{categoryChartRef.current.destroy();}catch(_){} }
                    categoryChartRef.current = new Chart(categoryCanvasRef.current, {
                        type: 'bar',
                        data: { labels:catEntries.map(e=>e[0]), datasets:[{ label:'Tickets', data:catEntries.map(e=>e[1]), backgroundColor:'#833089', borderRadius:4 }] },
                        options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ stepSize:1, precision:0, color: dm ? '#8fa4cc' : '#64748B' }, grid:{ color: dm ? 'rgba(109,39,115,0.08)' : '#F3F4F6' } }, y:{ grid:{ color: dm ? 'rgba(109,39,115,0.08)' : '#F3F4F6' }, ticks:{ color: dm ? '#8fa4cc' : '#64748B' } } } }
                    });
                });
                }); // end loadChartJs().then
                return ()=>{ cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
            }, [tickets]);

            const [insight, setInsight] = React.useState(null);

            const buildInsight = (type) => {
                const now2 = new Date();
                const getStatus   = t => (t.status||t.status_id||'');
                const getCategory = t => (t.categoryLabel||t.category||t.category_id||'Other');
                const getAssignee = t => (t.assigneeName||t.assignedToName||'Unassigned');
                const getPriority = t => (t.priorityLabel||t.priority||t.priority_id||'Low');
                const isResolved  = t => ['resolved','closed'].includes(getStatus(t));
                const fmtAge = t => { const d=Math.floor((now2-new Date(t.createdAt||t.date||now2))/86400000); return d===0?'Today':d===1?'Yesterday':`${d}d ago`; };
                const pBadge = p => { const l=p.toLowerCase(); return l==='critical'||l==='urgent'?{bg:dm?'rgba(239,68,68,0.15)':'#FEF2F2',color:dm?'#fca5a5':'#DC2626'}:l==='high'?{bg:dm?'rgba(249,115,22,0.15)':'#FFF7ED',color:dm?'#fdba74':'#EA580C'}:l==='medium'?{bg:dm?'rgba(234,179,8,0.15)':'#FEFCE8',color:dm?'#fcd34d':'#A16207'}:{bg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:dm?'#C77DB8':'#5D2162'}; };
                const tkRow = t => { const p=getPriority(t); const pb=pBadge(p); return {title:t.title||t.subtitle||t.title_type||'Untitled',sub:`${getAssignee(t)} · ${getCategory(t)} · ${fmtAge(t)}`,badge:p,badgeBg:pb.bg,badgeColor:pb.color}; };

                if (type==='total') {
                    const catMap={};tickets.forEach(t=>{const c=getCategory(t);catMap[c]=(catMap[c]||0)+1;});
                    const topCat=Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
                    const openPct=total?Math.round((open/total)*100):0; const resPct2=total?Math.round((resolved/total)*100):0;
                    return { title:'All Tickets', subtitle:`Complete overview of ${total} tickets in the system`, icon:'clipboard-list', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Total',value:total,color:dm?'#C77DB8':'#6D2773'},{label:'Open',value:open,color:'#F97316'},{label:'Resolved',value:resolved,color:'#10B981'}],
                        insights:[
                            {type:resPct2>=70?'good':'warn',icon:resPct2>=70?'check-circle':'alert-triangle',title:'Resolution Health',text:`${resPct2}% of all tickets have been resolved. ${resPct2>=70?'Team throughput is strong and demand is being managed well.':resPct2>=50?'Resolution rate is moderate — review workload allocation across staff.':'Resolution rate is below optimal — recommend triaging the backlog urgently.'}`},
                            {type:openPct>50?'bad':openPct>25?'warn':'good',icon:openPct>50?'alert-octagon':openPct>25?'alert-triangle':'check-circle',title:'Open Backlog Health',text:`${openPct}% of tickets are currently open (${open} tickets). ${openPct>50?'Backlog is growing — staff capacity may need to be reviewed or redistributed.':openPct>25?'Moderate open load — monitor closely to prevent accumulation.':'Healthy balance between open and resolved work.'}`},
                            escalated>0?{type:'warn',icon:'arrow-up-circle',title:'Escalations Require Attention',text:`${escalated} ticket${escalated!==1?'s have':' has'} been escalated. Recurring escalations in the same category may signal a systemic workflow issue worth investigating.`}:{type:'good',icon:'sparkles',title:'Zero Escalations',text:'No tickets have been escalated — this reflects strong first-contact resolution quality and effective service delivery.'},
                            topCat?{type:'info',icon:'map-pin',title:'Highest Volume Category',text:`"${topCat[0].replace(/_/g,' ')}" accounts for ${topCat[1]} ticket${topCat[1]!==1?'s':''} (${Math.round((topCat[1]/total)*100)}% of total). Ensure adequate resource allocation and process documentation for this service area.`}:null,
                        ].filter(Boolean),
                        breakdown:Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([label,value])=>({label,value,bar:Math.round((value/total)*100),sub:`${Math.round((value/total)*100)}%`})),
                        breakdownTitle:'Volume by Category',
                    };
                }
                if (type==='open') {
                    const openTkts=tickets.filter(t=>['new','assigned'].includes(getStatus(t))).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
                    const unassigned=openTkts.filter(t=>!t.assigneeName&&!t.assignedToName).length;
                    const byA={};openTkts.forEach(t=>{const a=getAssignee(t);byA[a]=(byA[a]||0)+1;});
                    const oldest=openTkts[0]; const oldDays=oldest?Math.floor((now2-new Date(oldest.createdAt||0))/86400000):0;
                    const topHolder=Object.entries(byA).sort((a,b)=>b[1]-a[1])[0];
                    return { title:'Open Tickets', subtitle:`${open} tickets awaiting action`, icon:'clock', iconBg:dm?'rgba(14,165,233,0.12)':'#E0F2FE',
                        metrics:[{label:'New',value:openTkts.filter(t=>getStatus(t)==='new').length,color:'#06B6D4'},{label:'Assigned',value:openTkts.filter(t=>getStatus(t)==='assigned').length,color:'#3B82F6'},{label:'Unassigned',value:unassigned,color:'#EF4444'}],
                        insights:[
                            unassigned>0?{type:'bad',icon:'alert-octagon',title:`${unassigned} Unassigned Ticket${unassigned!==1?'s':''}`,text:`${unassigned} open ticket${unassigned!==1?'s have':' has'} no assignee. Unassigned tickets risk being overlooked — assign them immediately to prevent SLA breaches.`}:{type:'good',icon:'check-circle',title:'All Open Tickets Assigned',text:'Every open ticket has an assignee — excellent queue management and accountability.'},
                            oldest?{type:oldDays>7?'bad':oldDays>3?'warn':'info',icon:'hourglass',title:'Oldest Open Ticket',text:`"${oldest.subtitle||oldest.title_type||'Untitled'}" has been open for ${oldDays} day${oldDays!==1?'s':''}. ${oldDays>7?'This warrants immediate review and escalation.':oldDays>3?'Consider prioritising resolution to prevent SLA breach.':'Within normal response window.'}`}:null,
                            topHolder?{type:'info',icon:'user',title:'Queue Distribution',text:`Open tickets span ${Object.keys(byA).length} staff. Top holder: ${topHolder[0]} (${topHolder[1]} ticket${topHolder[1]!==1?'s':''}). ${unassigned>0?`${unassigned} still awaiting assignment.`:''}`}:null,
                        ].filter(Boolean),
                        rows:openTkts.map(tkRow), rowsTitle:'Open Tickets (oldest first)',
                    };
                }
                if (type==='inprogress') {
                    const inpTkts=tickets.filter(t=>['in_progress','waiting','pending_approval'].includes(getStatus(t)));
                    const byA={};inpTkts.forEach(t=>{const a=getAssignee(t);byA[a]=(byA[a]||0)+1;});
                    const waiting=inpTkts.filter(t=>getStatus(t)==='waiting').length;
                    const pendApp=inpTkts.filter(t=>getStatus(t)==='pending_approval').length;
                    return { title:'In Progress', subtitle:`${inProg} tickets actively being worked`, icon:'settings', iconBg:dm?'rgba(245,158,11,0.12)':'#FFFBEB',
                        metrics:[{label:'In Progress',value:inpTkts.filter(t=>getStatus(t)==='in_progress').length,color:'#F59E0B'},{label:'Waiting',value:waiting,color:'#833089'},{label:'Pending Approval',value:pendApp,color:'#EC4899'}],
                        insights:[
                            waiting>0?{type:'warn',icon:'pause-circle',title:`${waiting} Blocked on External Input`,text:`${waiting} ticket${waiting!==1?'s are':' is'} in "Waiting" status. Follow up with clients or third parties to unblock these and prevent SLA impact.`}:{type:'good',icon:'check-circle',title:'No Blocked Tickets',text:'No tickets are in "Waiting" status — all active work is progressing without external blockers.'},
                            pendApp>0?{type:'warn',icon:'clipboard-list',title:`${pendApp} Awaiting Approval`,text:`${pendApp} ticket${pendApp!==1?'s require':' requires'} approval to proceed. Ensure approvers have been notified — approval delays directly extend resolution time.`}:null,
                            Object.keys(byA).length>0?{type:'info',icon:'users',title:'Active Team Workload',text:`Active work is distributed across ${Object.keys(byA).length} staff member${Object.keys(byA).length!==1?'s':''}. ${Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,c])=>`${n}: ${c}`).join(' · ')}.`}:null,
                        ].filter(Boolean),
                        rows:inpTkts.map(t=>{const s=getStatus(t);const SC={in_progress:{bg:dm?'rgba(245,158,11,0.15)':'#FFFBEB',c:dm?'#fcd34d':'#D97706'},waiting:{bg:dm?'rgba(131,47,138,0.15)':'#F5F3FF',c:dm?'#c4b5fd':'#6D2773'},pending_approval:{bg:dm?'rgba(236,72,153,0.15)':'#FDF2F8',c:dm?'#f9a8d4':'#DB2777'}};const sc=SC[s]||SC.in_progress;return {title:t.title||t.subtitle||t.title_type||'Untitled',sub:`${getAssignee(t)} · ${fmtAge(t)}`,badge:s.replace(/_/g,' '),badgeBg:sc.bg,badgeColor:sc.c};}),
                        rowsTitle:'In-Progress Tickets',
                    };
                }
                if (type==='resolved') {
                    const resTkts2=tickets.filter(isResolved);
                    const slaOkL=resTkts2.filter(t=>!(t.slaBreached||t.sla_breached)).length;
                    const byA={};resTkts2.forEach(t=>{const a=getAssignee(t);byA[a]=(byA[a]||0)+1;});
                    const topRes=Object.entries(byA).sort((a,b)=>b[1]-a[1])[0];
                    const slaPctL=resTkts2.length>0?Math.round((slaOkL/resTkts2.length)*100):0;
                    return { title:'Resolved Tickets', subtitle:`${resolved} tickets successfully closed`, icon:'check-circle', iconBg:dm?'rgba(16,185,129,0.12)':'#ECFDF5',
                        metrics:[{label:'Resolved',value:resTkts2.filter(t=>getStatus(t)==='resolved').length,color:'#10B981'},{label:'Closed',value:resTkts2.filter(t=>getStatus(t)==='closed').length,color:'#833089'},{label:'SLA Met',value:`${slaPctL}%`,color:'#10B981'}],
                        insights:[
                            {type:slaPctL>=80?'good':'warn',icon:'clock',title:'SLA Performance on Resolved',text:`${slaOkL} of ${resTkts2.length} resolved tickets met SLA requirements (${slaPctL}%). ${resTkts2.length-slaOkL>0?`${resTkts2.length-slaOkL} were closed late — review those cases for process improvements.`:'All resolutions were on time — excellent.'}`},
                            topRes?{type:'good',icon:'award',title:'Top Resolver',text:`${topRes[0]} has resolved the most tickets (${topRes[1]}). Recognising high performers reinforces service excellence and motivates the broader team.`}:null,
                            {type:'info',icon:'bar-chart-2',title:'Resolution Rate',text:`${resRate}% of all tickets have been resolved. ${resRate>=80?'Excellent throughput — team capacity is well matched to demand.':resRate>=60?'Good throughput — check if any categories are creating resolution bottlenecks.':'Consider reviewing workflow — a lower resolution rate may indicate process or capacity gaps.'}`},
                        ].filter(Boolean),
                        breakdown:Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([label,value])=>({label,value,bar:resTkts2.length?Math.round((value/resTkts2.length)*100):0,sub:`${resTkts2.length?Math.round((value/resTkts2.length)*100):0}%`})),
                        breakdownTitle:'Resolved by Staff Member',
                    };
                }
                if (type==='escalated') {
                    const escTkts=tickets.filter(t=>t.isEscalated||t.escalated||t.status==='escalated');
                    const byCat={};escTkts.forEach(t=>{const c=getCategory(t);byCat[c]=(byCat[c]||0)+1;});
                    const stillOpen=escTkts.filter(t=>!isResolved(t)).length;
                    return { title:'Escalated Tickets', subtitle:`${escalated} tickets flagged as escalated`, icon:'arrow-up-circle', iconBg:dm?'rgba(109,39,115,0.12)':'#F5F3FF',
                        metrics:[{label:'Escalated',value:escalated,color:'#6D2773'},{label:'% of Total',value:`${total?Math.round((escalated/total)*100):0}%`,color:'#833089'},{label:'Still Open',value:stillOpen,color:'#EF4444'}],
                        insights:[
                            escalated===0?{type:'good',icon:'sparkles',title:'Zero Escalations',text:'No escalated tickets — this reflects strong first-contact resolution, effective staff training, and proactive client communication.'}:{type:'warn',icon:'alert-triangle',title:'Escalation Pattern',text:`Escalations are concentrated in: ${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,n])=>`${c.replace(/_/g,' ')} (${n})`).join(', ')}. Address these categories to reduce future escalation rates.`},
                            stillOpen>0?{type:'bad',icon:'alert-octagon',title:'Open Escalations Need Immediate Action',text:`${stillOpen} escalated ticket${stillOpen!==1?'s remain':' remains'} unresolved. Escalated open tickets carry the highest risk to client satisfaction and SLA compliance.`}:null,
                        ].filter(Boolean),
                        rows:escTkts.map(tkRow), rowsTitle:'Escalated Tickets',
                    };
                }
                if (type==='overdue') {
                    const ovdTkts=tickets.filter(t=>!isResolved(t)&&t.dueAt&&new Date(t.dueAt)<now2).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));
                    const fmtOvd=t=>{const d=Math.floor((now2-new Date(t.dueAt))/86400000);return `${d}d overdue`;};
                    const critOvd=ovdTkts.filter(t=>['critical','urgent'].includes(getPriority(t).toLowerCase())).length;
                    const potentialSla=Math.round((slaOk+overdue)/Math.max(slaTotalEval,1)*100);
                    return { title:'Overdue Tickets', subtitle:`${overdue} tickets past their due date`, icon:'alert-triangle', iconBg:dm?'rgba(239,68,68,0.12)':'#FEF2F2',
                        metrics:[{label:'Overdue',value:overdue,color:'#EF4444'},{label:'% of Open',value:`${open>0?Math.round((overdue/open)*100):0}%`,color:'#F97316'},{label:'Critical',value:critOvd,color:'#DC2626'}],
                        insights:[
                            overdue===0?{type:'good',icon:'target',title:'No Overdue Tickets',text:'All active tickets are within their due dates — excellent deadline management and client commitment.'}:{type:'bad',icon:'alert-octagon',title:'Immediate Action Required',text:`${overdue} ticket${overdue!==1?'s are':' is'} past due. Overdue tickets risk SLA breaches, client dissatisfaction, and potential compliance issues. Prioritise resolution today.`},
                            critOvd>0?{type:'bad',icon:'alert-circle',title:`${critOvd} Critical/Urgent Overdue`,text:`${critOvd} overdue ticket${critOvd!==1?'s are':' is'} Critical or Urgent priority. These represent the highest business risk and should be escalated and resolved immediately.`}:null,
                            overdue>0?{type:'warn',icon:'activity',title:'SLA Recovery Opportunity',text:`Resolving all ${overdue} overdue tickets would recover your SLA rate from ${slaPct}% to a potential ${potentialSla}% — a ${potentialSla-slaPct} point improvement.`}:null,
                        ].filter(Boolean),
                        rows:ovdTkts.map(t=>{const p=getPriority(t);const pb=pBadge(p);return{title:t.subtitle||t.title_type||'Untitled',sub:`${getAssignee(t)} · ${fmtOvd(t)} · ${getCategory(t)}`,badge:p,badgeBg:pb.bg,badgeColor:pb.color};}),
                        rowsTitle:'Overdue Tickets (most overdue first)',
                    };
                }
                if (type==='urgent') {
                    const urgTkts=tickets.filter(t=>['critical','urgent'].includes(getPriority(t).toLowerCase()));
                    const openUrg=urgTkts.filter(t=>!isResolved(t));
                    return { title:'Urgent & Critical Tickets', subtitle:`${urgent} high-priority tickets`, icon:'alert-circle', iconBg:dm?'rgba(220,38,38,0.12)':'#FFF1F2',
                        metrics:[{label:'Critical/Urgent',value:urgent,color:'#DC2626'},{label:'Still Open',value:openUrg.length,color:'#EF4444'},{label:'Resolved',value:urgTkts.length-openUrg.length,color:'#10B981'}],
                        insights:[
                            urgent===0?{type:'good',icon:'check-circle',title:'No Critical Tickets',text:'No critical or urgent tickets — excellent risk management and proactive service delivery.'}:
                            openUrg.length>0?{type:'bad',icon:'alert-octagon',title:`${openUrg.length} Critical Ticket${openUrg.length!==1?'s':''} Unresolved`,text:`${openUrg.length} open critical/urgent ticket${openUrg.length!==1?'s require':' requires'} immediate resolution. Delays in critical tickets can cause significant service disruption and client escalations.`}:
                            {type:'good',icon:'check-circle',title:'All Critical Tickets Resolved',text:`All ${urgent} critical/urgent ticket${urgent!==1?'s have':' has'} been resolved — excellent responsiveness to high-priority issues.`},
                            urgent>0&&total>0?{type:Math.round((urgent/total)*100)>20?'bad':'info',icon:'bar-chart-2',title:'Priority Distribution Risk',text:`Critical/Urgent tickets represent ${Math.round((urgent/total)*100)}% of all tickets. ${Math.round((urgent/total)*100)>20?'A high proportion of critical tickets may indicate systemic service issues — investigate root causes and consider preventative measures.':'This proportion is within a manageable range.'}`}:null,
                        ].filter(Boolean),
                        rows:urgTkts.sort((a,b)=>isResolved(a)?1:-1).map(t=>{const s=getStatus(t);const res=isResolved(t);return{title:t.subtitle||t.title_type||'Untitled',sub:`${getAssignee(t)} · ${getCategory(t)} · ${fmtAge(t)}`,badge:s.replace(/_/g,' '),badgeBg:res?(dm?'rgba(16,185,129,0.15)':'#ECFDF5'):(dm?'rgba(239,68,68,0.15)':'#FEF2F2'),badgeColor:res?'#10B981':'#DC2626'};}),
                        rowsTitle:'Critical & Urgent Tickets',
                    };
                }
                if (type==='status-chart') {
                    const sMap={};tickets.forEach(t=>{const s=getStatus(t);sMap[s]=(sMap[s]||0)+1;});
                    const SC2={new:'#06B6D4',assigned:'#3B82F6',in_progress:'#F59E0B',waiting:'#833089',pending_approval:'#EC4899',resolved:'#10B981',closed:'#475569',escalated:'#6D2773'};
                    return { title:'Status Distribution', subtitle:'Full pipeline breakdown by current status', icon:'bar-chart-2', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Total Tickets',value:total,color:dm?'#C77DB8':'#6D2773'},{label:'Active',value:open+inProg,color:'#F59E0B'},{label:'Completed',value:resolved,color:'#10B981'}],
                        insights:[
                            {type:'info',icon:'trending-up',title:'Pipeline Health',text:`${open+inProg} tickets are actively in the pipeline (${total?Math.round(((open+inProg)/total)*100):0}% of total). ${resolved} have been completed and ${overdue} are past due.`},
                            inProg>open?{type:'good',icon:'settings',title:'Strong Throughput Velocity',text:'More tickets are in progress than waiting in queue — the team has excellent throughput and is actively servicing demand.'}:open>inProg*2?{type:'warn',icon:'pause-circle',title:'Potential Queue Bottleneck',text:`${open} tickets are queued as "Open" versus only ${inProg} in progress. Consider reviewing team capacity or ticket assignment processes to prevent backlog growth.`}:{type:'info',icon:'layers',title:'Balanced Pipeline',text:'Open and in-progress tickets are in proportion — pipeline flow appears healthy with no major bottlenecks.'},
                        ],
                        breakdown:Object.entries(sMap).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label:label.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),value,dot:SC2[label]||'#833089',bar:Math.round((value/Math.max(total,1))*100),sub:`${Math.round((value/Math.max(total,1))*100)}%`})),
                        breakdownTitle:'Status Breakdown',
                    };
                }
                if (type==='category-chart') {
                    const catMap={};tickets.forEach(t=>{const c=getCategory(t);catMap[c]=(catMap[c]||0)+1;});
                    const catE=Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
                    const openByCat={};tickets.filter(t=>!isResolved(t)).forEach(t=>{const c=getCategory(t);openByCat[c]=(openByCat[c]||0)+1;});
                    const top=catE[0];
                    const top2vol=catE.slice(0,2).reduce((s,[,v])=>s+v,0);
                    return { title:'Category Breakdown', subtitle:'Ticket volume and open load per service category', icon:'scroll-text', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Categories',value:catE.length,color:dm?'#C77DB8':'#6D2773'},{label:'Top Volume',value:top?top[1]:0,color:'#F97316'},{label:'Open in Top',value:top?openByCat[top[0]]||0:0,color:'#EF4444'}],
                        insights:[
                            top?{type:'info',icon:'map-pin',title:`"${top[0].replace(/_/g,' ')}" Leads Volume`,text:`This category accounts for ${top[1]} ticket${top[1]!==1?'s':''} (${Math.round((top[1]/total)*100)}% of total). ${openByCat[top[0]]>0?`${openByCat[top[0]]} are still open.`:''} Ensure adequate resources and documented processes are in place.`}:null,
                            catE.length>1?{type:top2vol/total>0.7?'warn':'info',icon:'layers',title:'Category Concentration',text:top2vol/total>0.7?`Top 2 categories represent ${Math.round(top2vol/total*100)}% of all tickets. High concentration may indicate a gap in service coverage or a recurring systemic issue in these areas.`:`Ticket volume is distributed across ${catE.length} categories — healthy service breadth with no extreme concentration.`}:null,
                        ].filter(Boolean),
                        breakdown:catE.map(([label,value])=>({label:label.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),value,bar:Math.round((value/total)*100),sub:`${openByCat[label]||0} open`})),
                        breakdownTitle:'Volume by Category',
                    };
                }
                if (type==='sla') {
                    const potSla=Math.round((slaOk+overdue)/Math.max(slaTotalEval,1)*100);
                    return { title:'SLA Compliance', subtitle:'Service Level Agreement performance analysis', icon:'clock', iconBg:dm?'rgba(16,185,129,0.12)':'#ECFDF5',
                        metrics:[{label:'SLA Rate',value:`${slaPct}%`,color:slaPct>=80?'#10B981':slaPct>=50?'#F59E0B':'#EF4444'},{label:'On Time',value:slaOk,color:'#10B981'},{label:'Breached',value:slaFailed+overdue,color:'#EF4444'}],
                        insights:[
                            {type:slaPct>=90?'good':slaPct>=70?'warn':'bad',icon:slaPct>=90?'check-circle':slaPct>=70?'alert-triangle':'alert-octagon',title:`SLA Compliance: ${slaPct}%`,text:slaPct>=90?'Excellent SLA performance — the team consistently meets service commitments, building strong client trust.':slaPct>=70?'SLA compliance is within an acceptable range but has clear room for improvement. Focus on reducing overdue tickets first.':'SLA compliance is below target. An immediate review of ticket resolution workflows, staff capacity, and escalation processes is recommended.'},
                            overdue>0?{type:'bad',icon:'clock',title:`${overdue} Active Overdue — Direct SLA Impact`,text:`${overdue} ticket${overdue!==1?'s are':' is'} currently open past their due date. Each is an active SLA breach. Resolving these would push SLA from ${slaPct}% to a potential ${potSla}%.`}:{type:'good',icon:'target',title:'No Active Overdue Tickets',text:'All active tickets are within their due dates — SLA pressure is only from historically late closures.'},
                            slaFailed>0?{type:'warn',icon:'clipboard-list',title:`${slaFailed} Late Closures`,text:`${slaFailed} resolved ticket${slaFailed!==1?'s were':' was'} closed after their due date. Review these cases to identify patterns — common causes include under-staffing, unclear ownership, or complex category types.`}:null,
                            {type:'info',icon:'info',title:'How SLA is Calculated',text:`SLA = on-time closures ÷ (all resolved + active overdue) = ${slaOk} ÷ ${slaTotalEval} = ${slaPct}%. Reducing active overdue to zero would result in ${Math.round(slaOk/Math.max(resTkts.length,1)*100)}% SLA.`},
                        ].filter(Boolean),
                        breakdown:[{label:'Resolved On Time',value:slaOk,dot:'#10B981',bar:slaTotalEval?Math.round((slaOk/slaTotalEval)*100):0,sub:'on time'},{label:'Resolved Late',value:slaFailed,dot:'#F97316',bar:slaTotalEval?Math.round((slaFailed/slaTotalEval)*100):0,sub:'late'},{label:'Active Overdue',value:overdue,dot:'#EF4444',bar:slaTotalEval?Math.round((overdue/slaTotalEval)*100):0,sub:'past due'},{label:'Active Staff',value:staffCount,dot:'#0EA5E9',bar:0,sub:'staff'}],
                        breakdownTitle:'SLA Components',
                    };
                }
                return null;
            };

            const statCards = [
                { id:'total',      label:'Total Tickets',  value:total,     color:dm?'#C77DB8':'#6D2773', bg:'#F6ECF4', icon:'clipboard-list' },
                { id:'open',       label:'Open',           value:open,      color:'#0EA5E9', bg:'#E0F2FE', icon:'clock' },
                { id:'inprogress', label:'In Progress',    value:inProg,    color:'#F59E0B', bg:'#FFFBEB', icon:'settings' },
                { id:'resolved',   label:'Resolved',       value:resolved,  color:'#10B981', bg:'#ECFDF5', icon:'check-circle' },
                { id:'escalated',  label:'Escalated',      value:escalated, color:'#6D2773', bg:'#F5F3FF', icon:'arrow-up-circle' },
                { id:'overdue',    label:'Overdue',        value:overdue,   color:'#EF4444', bg:'#FEF2F2', icon:'alert-triangle' },
                { id:'urgent',     label:'Urgent/Critical',value:urgent,    color:'#DC2626', bg:'#FFF1F2', icon:'alert-circle' },
            ];

            const card = {background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,
                boxShadow: dm
                    ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 6px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.6), 0 0 80px -30px rgba(109,39,115,0.10)'
                    : '0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0  0 0 1px rgba(15,23,42,0.03)'};

            return (<>
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    <div style={{maxWidth:'1400px',margin:'0 auto',padding:'24px'}}>

                        {/* Header */}
                        <div style={{marginBottom:'20px'}}>
                            <h1 style={{fontSize:'20px',fontWeight:'700',color:textP,margin:0}}>Dashboard</h1>
                            <p style={{fontSize:'13px',color:textM,margin:'3px 0 0'}}>Yahweh Care — Ticket Management</p>
                        </div>

                        {/* Stat cards */}
                        <div className='yc-stat-cards' style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:'12px',marginBottom:'20px'}}>
                            {statCards.map((c,i)=>(
                                <div key={i} onClick={()=>!loading&&setInsight(buildInsight(c.id))}
                                    style={{...card,padding:'16px',cursor:loading?'default':'pointer',transition:'transform 0.12s,box-shadow 0.12s'}}
                                    onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=dm?'0 8px 32px rgba(0,0,0,0.6),0 0 0 1px rgba(109,39,115,0.2)':'0 8px 24px rgba(109,39,115,0.12),0 0 0 1px rgba(109,39,115,0.1)'}}}
                                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                                        <div>
                                            <p style={{fontSize:'11px',color:textM,fontWeight:'600',margin:0,textTransform:'uppercase',letterSpacing:'0.04em'}}>{c.label}</p>
                                            <p style={{fontSize:'28px',fontWeight:'800',color:c.color,margin:'6px 0 0',lineHeight:1}}>
                                                {loading ? '—' : c.value}
                                            </p>
                                        </div>
                                        <span style={{background:c.bg,borderRadius:'8px',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={c.icon} size={20} color={c.color} /></span>
                                    </div>
                                    {!loading && <p style={{fontSize:'9px',color:dm?'rgba(109,39,115,0.5)':'rgba(109,39,115,0.4)',margin:'8px 0 0',fontWeight:'600',letterSpacing:'0.06em'}}>CLICK FOR INSIGHTS →</p>}
                                </div>
                            ))}
                        </div>

                        {/* Charts row */}
                        <div className='yc-chart-grid-2' style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
                            <div onClick={()=>!loading&&setInsight(buildInsight('status-chart'))} style={{...card,padding:'20px',cursor:loading?'default':'pointer',transition:'transform 0.12s'}} onMouseEnter={e=>{if(!loading)e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                                    <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,margin:0,display:'flex',alignItems:'center',gap:6}}><Icon name="bar-chart-2" size={14} />Status Distribution</h2>
                                    {!loading && <span style={{fontSize:'9px',color:dm?'rgba(109,39,115,0.5)':'rgba(109,39,115,0.4)',fontWeight:'700',letterSpacing:'0.06em'}}>CLICK FOR INSIGHTS</span>}
                                </div>
                                <div style={{height:'220px',position:'relative'}}>
                                    {loading ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:textM,fontSize:'13px'}}>Loading…</div>
                                             : <canvas ref={statusCanvasRef}></canvas>}
                                </div>
                            </div>
                            <div onClick={()=>!loading&&setInsight(buildInsight('category-chart'))} style={{...card,padding:'20px',cursor:loading?'default':'pointer',transition:'transform 0.12s'}} onMouseEnter={e=>{if(!loading)e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                                    <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,margin:0,display:'flex',alignItems:'center',gap:6}}><Icon name='tag' size={14} color={textM} />Category Breakdown</h2>
                                    {!loading && <span style={{fontSize:'9px',color:dm?'rgba(109,39,115,0.5)':'rgba(109,39,115,0.4)',fontWeight:'700',letterSpacing:'0.06em'}}>CLICK FOR INSIGHTS</span>}
                                </div>
                                <div style={{height:'220px',position:'relative'}}>
                                    {loading ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:textM,fontSize:'13px'}}>Loading…</div>
                                             : <canvas ref={categoryCanvasRef}></canvas>}
                                </div>
                            </div>
                        </div>

                        {/* SLA + Activity row */}
                        <div className='yc-chart-grid-2' style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

                            {/* SLA Compliance */}
                            <div onClick={()=>!loading&&setInsight(buildInsight('sla'))} style={{...card,padding:'20px',cursor:loading?'default':'pointer',transition:'transform 0.12s'}} onMouseEnter={e=>{if(!loading)e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
                                    <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,margin:0}}><Icon name='clock' size={14} style={{marginRight:5}} />SLA Compliance</h2>
                                    {!loading && <span style={{fontSize:'9px',color:dm?'rgba(109,39,115,0.5)':'rgba(109,39,115,0.4)',fontWeight:'700',letterSpacing:'0.06em'}}>CLICK FOR INSIGHTS</span>}
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:'24px'}}>
                                    <div style={{position:'relative',flexShrink:0}}>
                                        <svg width="120" height="120" viewBox="0 0 120 120" style={{transform:'rotate(-90deg)'}}>
                                            <circle cx="60" cy="60" r={r} stroke={dm?'#334155':'#F3F4F6'} strokeWidth="10" fill="none"/>
                                            <circle cx="60" cy="60" r={r} stroke={slaPct>=80?'#10B981':slaPct>=50?'#F59E0B':'#EF4444'} strokeWidth="10" fill="none"
                                                strokeDasharray={`${circ*slaPct/100} ${circ}`} strokeLinecap="round"/>
                                        </svg>
                                        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                                            <span style={{fontSize:'22px',fontWeight:'800',color:textP}}>{loading?'—':slaPct+'%'}</span>
                                            <span style={{fontSize:'10px',color:textM}}>SLA Met</span>
                                        </div>
                                    </div>
                                    <div style={{flex:1}}>
                                        {[
                                            {label:'Total Tickets', val:total,    color:dm?'#C77DB8':'#6D2773'},
                                            {label:'Resolved',      val:resolved, color:'#10B981'},
                                            {label:'Overdue',       val:overdue,  color:'#EF4444'},
                                            {label:'Active Staff',  val:staffCount,color:'#0EA5E9'},
                                        ].map((row,i)=>(
                                            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<3?`1px solid ${borderC}`:'none'}}>
                                                <span style={{fontSize:'12px',color:textM}}>{row.label}</span>
                                                <span style={{fontSize:'13px',fontWeight:'700',color:row.color}}>{loading?'—':row.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div style={{...card,padding:'20px'}}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                                    <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,margin:0}}><Icon name='map-pin' size={14} style={{marginRight:5}} />Recent Activity</h2>
                                    <span style={{fontSize:'10px',background:'#ECFDF5',color:'#059669',borderRadius:'20px',padding:'2px 8px',fontWeight:'600'}}>Live</span>
                                </div>
                                {loading ? (
                                    <p style={{fontSize:'13px',color:dm?'#4a607f':'#94A3B8',textAlign:'center',padding:'20px 0'}}>Loading…</p>
                                ) : recentActivity.length === 0 ? (
                                    <p style={{fontSize:'13px',color:dm?'#4a607f':'#94A3B8',textAlign:'center',padding:'20px 0'}}>No recent activity</p>
                                ) : recentActivity.map((log, i) => {
                                    const am = ACTION_META[log.action] || { label: log.action, bg: '#EEF2F8', color: '#475569' };
                                    const initials = (log.actorName||'?').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
                                    return (
                                        <div key={i} style={{display:'flex',gap:'10px',paddingBottom:'10px',borderBottom:i<recentActivity.length-1?'1px solid #F3F4F6':'none',marginBottom:i<recentActivity.length-1?'10px':0}}>
                                            <div style={{width:32,height:32,borderRadius:'50%',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:dm?'#C77DB8':'#6D2773',flexShrink:0}}>
                                                {initials}
                                            </div>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                    <span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:20,background:am.bg,color:am.color}}>{am.label}</span>
                                                    <span style={{fontSize:12,color:dm?'#c0cfec':'#334155',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'160px'}}>{log.ticketTitle}</span>
                                                </div>
                                                <p style={{fontSize:11,color:dm?'#4a607f':'#94A3B8',margin:'3px 0 0'}}>{log.actorName} · {fmtDate(log.at)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </main>
                {insight && <InsightDrawer data={insight} onClose={()=>setInsight(null)}/>}
            </>
            );
        });

        // Create Ticket Page
        const CreateTicket = React.memo(function CreateTicket() {

            const dm = useDark();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            // Read logged-in user from sessionStorage so we can auto-fill reporter fields
            const sessionUser = React.useMemo(() => getSessionUser(), []);

            const [formData, setFormData] = React.useState({
                title_type: '',
                title_type_other: '',
                subtitle: '',
                category_id: '',        // populated from lookups
                subcategory: '',
                issue_details: '',
                submitted_by: sessionUser?.name || '',
                email: sessionUser?.email || '',
                ndis_related: false,
                priority_id: '',        // populated from lookups
                initial_status: 'new',
                expected_completion: '',
                assigneeId: null,       // real DB user ID (null = unassigned)
                approval_mode: 'AnyOne',
                approver_ids: [],
                created_by: sessionUser?.id || null,
                assigned_to: null
            });
            const [loading, setLoading] = React.useState(false);
            const [lookups, setLookups] = React.useState(null);
            const [error, setError] = React.useState('');
            const [success, setSuccess] = React.useState(false);
            const [attachments, setAttachments] = React.useState([]);
            const [attachError, setAttachError] = React.useState('');
            const [approverSearch, setApproverSearch] = React.useState('');

            React.useEffect(() => {
                fetchLookups();
            }, []);

            const fetchLookups = async () => {
                // Fetch lookups and users independently so one failure doesn't poison the other
                const [lookupsRes, usersRes] = await Promise.allSettled([
                    fetch(`${HRMS_API}/lookup/all`, { credentials: 'include', headers: authHeaders() }),
                    fetch(`${HRMS_API}/users?status=active&limit=200`, { credentials: 'include', headers: authHeaders() })
                ]);

                // Parse categories/priorities from real API, fall back to mock only if truly needed
                let categories = LOOKUPS_MOCK.categories;
                let priorities = LOOKUPS_MOCK.priorities;
                let statuses   = LOOKUPS_MOCK.statuses;
                if (lookupsRes.status === 'fulfilled' && lookupsRes.value.ok) {
                    try {
                        const data = await lookupsRes.value.json();
                        if (data.categories?.length) categories = data.categories;
                        if (data.priorities?.length)  priorities = data.priorities;
                        if (data.statuses?.length)    statuses   = data.statuses;
                    } catch(_) {}
                }

                // Parse users list from real API
                let users = [];
                if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                    try {
                        const data = await usersRes.value.json();
                        users = (data.users || []).map(u => ({
                            id: u.id, name: u.name, email: u.email,
                            role: u.position_title || u.role || 'Staff'
                        }));
                    } catch(_) {}
                }

                setLookups({ categories, priorities, statuses, users });

                // Find current user in list to get their real DB id
                const currentUser = users.find(u => u.email?.toLowerCase() === sessionUser?.email?.toLowerCase());
                setFormData(prev => ({
                    ...prev,
                    created_by: currentUser?.id || prev.created_by,
                    category_id: prev.category_id || (categories[0]?.id || ''),
                    priority_id: prev.priority_id || (priorities.find(p => p.label?.toLowerCase() === 'medium')?.id || priorities[0]?.id || ''),
                }));
            };

            const ALLOWED_TYPES = [
                'application/pdf','application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain','text/rtf','application/rtf',
                'image/jpeg','image/png','image/gif','image/bmp','image/heic','image/heif',
            ];
            const MAX_TOTAL_MB = 8;

            const handleFileChange = (e) => {
                setAttachError('');
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                const invalid = files.filter(f => !ALLOWED_TYPES.includes(f.type) && !f.name.match(/\.(pdf|doc|docx|xls|xlsx|txt|rtf|jpg|jpeg|png|gif|bmp|heic|heif)$/i));
                if (invalid.length) { setAttachError(`Unsupported file type: ${invalid.map(f=>f.name).join(', ')}`); e.target.value=''; return; }
                const totalMB = (attachments.reduce((s,a)=>s+a.size,0) + files.reduce((s,f)=>s+f.size,0)) / 1024 / 1024;
                if (totalMB > MAX_TOTAL_MB) { setAttachError(`Total attachment size exceeds ${MAX_TOTAL_MB}MB limit`); e.target.value=''; return; }
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const base64 = ev.target.result.split(',')[1]; // strip data URI prefix
                        setAttachments(prev => [...prev, { name: file.name, type: file.type, size: file.size, content: base64 }]);
                    };
                    reader.readAsDataURL(file);
                });
                e.target.value = '';
            };

            const removeAttachment = (idx) => setAttachments(prev => prev.filter((_,i)=>i!==idx));

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                setSuccess(false);
                try {
                    if (!formData.title_type) {
                        setError('Please select a Title Type');
                        setLoading(false);
                        return;
                    }
                    if (formData.title_type === 'Other' && !formData.title_type_other?.trim()) {
                        setError('Please enter a Title Type');
                        setLoading(false);
                        return;
                    }
                    if (!formData.subtitle?.trim()) {
                        setError('Subtitle is required');
                        setLoading(false);
                        return;
                    }
                    if (!formData.category_id) {
                        setError('Please select a category');
                        setLoading(false);
                        return;
                    }
                    if (!formData.priority_id) {
                        setError('Please select a priority');
                        setLoading(false);
                        return;
                    }
                    if (!formData.expected_completion) {
                        setError('Expected Completion date is required');
                        setLoading(false);
                        return;
                    }
                    if (!formData.assigneeId) {
                        setError('Please assign the ticket to a staff member');
                        setLoading(false);
                        return;
                    }
                    if (Number(formData.assigneeId) === Number(formData.created_by)) {
                        setError('You cannot assign a ticket to yourself');
                        setLoading(false);
                        return;
                    }
                    if (!formData.approver_ids || formData.approver_ids.length === 0) {
                        setError('At least one approver must be selected');
                        setLoading(false);
                        return;
                    }
                    const submitData = { ...formData, attachments };
                    if (submitData.title_type === 'Other') submitData.title_type = submitData.title_type_other.trim();
                    delete submitData.title_type_other;
                    await API.tickets.create(submitData);
                    setSuccess(true);
                    // Scroll the page back to the top so the success banner is visible
                    document.querySelector('main.flex-1.overflow-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
                    setFormData({
                        title_type: '',
                        title_type_other: '',
                        subtitle: '',
                        category_id: '',
                        subcategory: '',
                        issue_details: '',
                        submitted_by: sessionUser?.name || '',
                        email: sessionUser?.email || '',
                        ndis_related: false,
                        priority_id: '',
                        initial_status: 'new',
                        expected_completion: '',
                        assigneeId: null,
                        approval_mode: 'AnyOne',
                        approver_ids: [],
                        created_by: sessionUser?.id || null,
                        assigned_to: null
                    });
                    setAttachments([]);
                    setAttachError('');
                    setTimeout(() => setSuccess(false), 5000);
                } catch (err) {
                    setError('Failed to create ticket: ' + err.message);
                } finally {
                    setLoading(false);
                }
            };

            const handleChange = (e) => {
                const { name, value, type, checked } = e.target;
                setFormData(prev => ({
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                }));
            };

            const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
            const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
            const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5";
            const sectionHeadCls = "text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2";

            // Use global getCatVisual() + CAT_VISUAL_MAP (defined above Icon component)
            const catVisual = (() => {
                if (!formData.category_id || !lookups) return null;
                const cat = (lookups.categories || []).find(c => String(c.id) === String(formData.category_id));
                if (!cat) return null;
                const v = getCatVisual(cat.label);
                // desc strings specific to Create Ticket context
                const DESC_MAP = {
                    monitor:        'IT infrastructure, software, hardware, or network support.',
                    briefcase:      'HR matters: leave, payroll, onboarding, performance, or staff disputes.',
                    building:       'Building, vehicle, or infrastructure maintenance requests.',
                    heart:          'Care coordination, participant support planning, or service delivery.',
                    activity:       'Clinical assessments, health records, or medical matters.',
                    shield:         'Regulatory, compliance, or workplace safety concerns.',
                    'dollar-sign':  'Financial transactions, invoicing, or budget concerns.',
                    'help-circle':  'General enquiries and other support requests.',
                    user:           'Issues affecting client care, communication, or service delivery.',
                    key:            'Account access, billing, credentials, or login concerns.',
                    sparkles:       'Cleaning standards, hygiene, or facility presentation issues.',
                    tool:           'Equipment faults, maintenance, or asset requests.',
                    'clipboard-list':'NDIS compliance, participant plans, or regulatory requirements.',
                    'alert-triangle':'Incidents, accidents, or unexpected events requiring formal reporting.',
                };
                return { ...v, label: cat.label, desc: DESC_MAP[v.icon] || '' };
            })();

            return (
                <main className="flex-1 overflow-auto" style={{background:'#F8F9FB'}}>
                    <div style={{maxWidth:'1100px', margin:'0 auto', padding:'clamp(16px,4vw,32px) clamp(12px,4vw,32px)'}}>
                        {/* Page header */}
                        <div className="mb-7">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 cursor-pointer hover:text-indigo-600 transition w-fit" onClick={() => {}}>
                                <span style={{fontSize:'16px'}}>←</span>
                                <span>Back</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Ticket</h1>
                            <p className="text-sm text-gray-400 mt-1">Submit a new support request</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                                <Icon name='alert-triangle' size={14} color='#DC2626' /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
                                <Icon name='check-circle' size={14} color='#059669' /> Ticket created successfully!
                            </div>
                        )}

                        {!lookups ? (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 24px'}}>
                                <SectionLoader message="Loading form…" size={44} />
                            </div>
                        ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Two-column layout — stacks on mobile/tablet */}
                            <div style={{display:'flex', gap:'24px', alignItems:'flex-start', flexWrap:'wrap'}}>
                                {/* LEFT COLUMN — main form */}
                                <div style={{flex:'1 1 420px', minWidth:0}}>
                                    {/* Ticket Details */}
                                    <div className={cardCls}>
                                        <div className={sectionHeadCls}>
                                            <Icon name='clipboard-list' size={15} color={dm?'#C77DB8':'#6D2773'} /> Ticket Details
                                        </div>
                                        <div className="grid gap-4 mb-4 yc-grid-2-col" style={{gridTemplateColumns:"repeat(2,1fr)"}} >
                                            <div>
                                                <label className={labelCls}>Title Type <span className="text-red-400">*</span></label>
                                                <select name="title_type" value={formData.title_type} onChange={handleChange} className={inputCls}>
                                                    <option value="">Select Title Type</option>
                                                    <option>Service Request</option>
                                                    <option>Complaint</option>
                                                    <option>Incident Report</option>
                                                    <option>Equipment Request</option>
                                                    <option>Schedule Change</option>
                                                    <option>Quality Issue</option>
                                                    <option>Safety Report</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Subtitle <span className="text-red-400">*</span></label>
                                                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Brief description" className={inputCls}/>
                                            </div>
                                            {formData.title_type === 'Other' && (
                                                <div style={{gridColumn:'1/-1'}}>
                                                    <label className={labelCls}>Specify Title Type <span className="text-red-400">*</span></label>
                                                    <input type="text" name="title_type_other" value={formData.title_type_other} onChange={handleChange} placeholder="Enter a title type" className={inputCls} autoFocus/>
                                                </div>
                                            )}
                                        </div>
                                        {/* Category visual picker */}
                                        <div className="mb-4">
                                            <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:'10px', marginTop:'6px'}}>
                                                {(lookups?.categories || []).map(c => {
                                                    const vis   = getCatVisual(c.label);
                                                    const icon  = vis.icon;
                                                    const color = vis.color;
                                                    const bg    = vis.bg;
                                                    const border= vis.border;
                                                    const isSelected = String(formData.category_id) === String(c.id);
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({...prev, category_id: c.id}))}
                                                            style={{
                                                                position:'relative',
                                                                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                                                gap:'8px', padding:'14px 10px', borderRadius:'12px', cursor:'pointer',
                                                                border: isSelected ? `2px solid ${color}` : `1.5px solid ${isSelected?border:'#E2E8F0'}`,
                                                                background: isSelected ? bg : (dm?'rgba(17,30,58,0.5)':'#FAFAFA'),
                                                                boxShadow: isSelected ? `0 4px 14px ${color}30` : 'none',
                                                                transform: isSelected ? 'translateY(-2px)' : 'none',
                                                                transition:'all 0.18s ease',
                                                                outline:'none',
                                                            }}
                                                            onMouseEnter={e=>{ if(!isSelected){ e.currentTarget.style.border=`1.5px solid ${border}`; e.currentTarget.style.background=bg+'99'; } }}
                                                            onMouseLeave={e=>{ if(!isSelected){ e.currentTarget.style.border='1.5px solid #E2E8F0'; e.currentTarget.style.background=dm?'rgba(17,30,58,0.5)':'#FAFAFA'; } }}
                                                        >
                                                            {/* Icon circle */}
                                                            <div style={{
                                                                width:'44px', height:'44px', borderRadius:'10px', flexShrink:0,
                                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                                background: isSelected ? color : (dm?'rgba(109,39,115,0.1)':bg),
                                                                transition:'background 0.18s',
                                                            }}>
                                                                <Icon name={icon} size={22} color={isSelected ? '#fff' : color} />
                                                            </div>
                                                            {/* Label */}
                                                            <span style={{
                                                                fontSize:'11px', fontWeight: isSelected ? 700 : 500,
                                                                color: isSelected ? color : (dm?'#8fa4cc':'#475569'),
                                                                textAlign:'center', lineHeight:1.3,
                                                                transition:'color 0.18s',
                                                            }}>{c.label}</span>
                                                            {/* Selected tick */}
                                                            {isSelected && (
                                                                <div style={{
                                                                    position:'absolute', top:'6px', right:'6px',
                                                                    width:'16px', height:'16px', borderRadius:'50%',
                                                                    background:color, display:'flex', alignItems:'center', justifyContent:'center',
                                                                }}>
                                                                    <Icon name='check' size={10} color='#fff' />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Subcategory — stays as a text input */}
                                        <div className="mb-4">
                                            <label className={labelCls}>Subcategory</label>
                                            <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange} placeholder="Optional subcategory" className={inputCls}/>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Issue Details <span className="text-red-400">*</span></label>
                                            <textarea name="issue_details" value={formData.issue_details} onChange={handleChange} placeholder="Describe the issue in detail…" rows="4" className={inputCls + " resize-none"}></textarea>
                                        </div>

                                        {/* Attachments */}
                                        <div>
                                            <label className={labelCls}>Attachments <span style={{fontSize:10,fontWeight:400,color:dm?'#4a607f':'#94A3B8'}}>(PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, BMP, HEIC — max 8 MB total)</span></label>
                                            <label style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',border:`2px dashed ${dm?'rgba(109,39,115,0.3)':'#E3BFDA'}`,borderRadius:8,cursor:'pointer',background:dm?'rgba(109,39,115,0.05)':'#F5F7FF',transition:'border-color 0.2s'}}
                                                onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#833089';}}
                                                onDragLeave={e=>{e.currentTarget.style.borderColor=dm?'rgba(109,39,115,0.3)':'#E3BFDA';}}
                                                onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=dm?'rgba(109,39,115,0.3)':'#E3BFDA';const dt={target:{files:e.dataTransfer.files,value:''}};handleFileChange(dt);}}>
                                                <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.heic,.heif" onChange={handleFileChange} style={{display:'none'}}/>
                                                <Icon name='paperclip' size={18} color={dm?'#C77DB8':'#6D2773'} />
                                                <span style={{fontSize:12,color:dm?'#8fa4cc':'#64748B'}}>Click to attach files or drag &amp; drop</span>
                                            </label>
                                            {attachError && <p style={{fontSize:11,color:'#DC2626',marginTop:4}}>{attachError}</p>}
                                            {attachments.length > 0 && (
                                                <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:4}}>
                                                    {attachments.map((a,i)=>(
                                                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:dm?'rgba(109,39,115,0.08)':'#F6ECF4',borderRadius:6,fontSize:12}}>
                                                            <Icon name={a.type.startsWith('image/')?'eye':a.type.includes('pdf')?'scroll-text':a.type.includes('sheet')||a.type.includes('excel')?'bar-chart-2':'file-edit'} size={14} color={dm?'#C77DB8':'#6D2773'} />
                                                            <span style={{flex:1,color:dm?'#E3BFDA':'#1E1B4B',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</span>
                                                            <span style={{color:dm?'#4a607f':'#94A3B8',flexShrink:0}}>{(a.size/1024).toFixed(0)} KB</span>
                                                            <button type="button" onClick={()=>removeAttachment(i)} style={{background:'none',border:'none',cursor:'pointer',color:'#DC2626',display:'flex',alignItems:'center',padding:'0 2px',flexShrink:0}}><Icon name='x' size={13} color='#DC2626' /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reporter Information */}
                                    <div className={cardCls}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={sectionHeadCls} style={{marginBottom:0,display:'flex',alignItems:'center',gap:6}}>
                                                <Icon name='user' size={14} color={dm?'#C77DB8':'#6D2773'} /> Reporter Information
                                            </div>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Icon name='lock' size={11} color='currentColor' /> Auto-filled from your account
                                            </span>
                                        </div>
                                        <div className="grid gap-4 mb-4 yc-grid-2-col" style={{gridTemplateColumns:"repeat(2,1fr)"}} >
                                            <div>
                                                <label className={labelCls}>Submitted By</label>
                                                <input type="text" value={sessionUser?.name || ''} className={inputCls + " bg-gray-50 text-gray-500 cursor-not-allowed"} readOnly disabled tabIndex={-1}/>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Email</label>
                                                <input type="email" value={sessionUser?.email || ''} className={inputCls + " bg-gray-50 text-gray-500 cursor-not-allowed"} readOnly disabled tabIndex={-1}/>
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <div className="relative">
                                                <input type="checkbox" name="ndis_related" checked={formData.ndis_related} onChange={handleChange} className="sr-only"/>
                                                <div className={`w-10 h-6 rounded-full transition ${formData.ndis_related ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.ndis_related ? 'left-5' : 'left-1'}`}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">NDIS Related</span>
                                        </label>
                                    </div>

                                    {/* Approvers — loaded from API */}
                                    {(() => {
                                        const approverList = (lookups && lookups.users) ? lookups.users.filter(u => u.id !== formData.assigneeId) : [];
                                        return (
                                        <div className={cardCls}>
                                            <div className={sectionHeadCls}>
                                                <Icon name='check-circle' size={15} color={dm?'#C77DB8':'#6D2773'} /> Approvers <span className="text-red-400 normal-case font-normal tracking-normal text-xs ml-1">*</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-3">Select who must approve the resolution. Click to toggle. <strong>All</strong> selected approvers must approve before the ticket closes.</p>
                                            {/* Search bar */}
                                            <div style={{position:'relative', marginBottom:'10px'}}>
                                                <div style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}>
                                                    <Icon name='search' size={13} color={dm?'#4a607f':'#94A3B8'} />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search approvers…"
                                                    value={approverSearch}
                                                    onChange={e => setApproverSearch(e.target.value)}
                                                    style={{
                                                        width:'100%', boxSizing:'border-box',
                                                        padding:'7px 10px 7px 30px',
                                                        border:`1.5px solid ${dm?'rgba(109,39,115,0.2)':'#E2E8F0'}`,
                                                        borderRadius:'8px', fontSize:'12px',
                                                        background: dm?'rgba(17,30,58,0.5)':'#F8FAFC',
                                                        color: dm?'#c0cfec':'#334155',
                                                        outline:'none',
                                                    }}
                                                    onFocus={e => e.target.style.borderColor='#833089'}
                                                    onBlur={e => e.target.style.borderColor=dm?'rgba(109,39,115,0.2)':'#E2E8F0'}
                                                />
                                                {approverSearch && (
                                                    <button type="button" onClick={() => setApproverSearch('')}
                                                        style={{position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:dm?'#4a607f':'#94A3B8', padding:0, display:'flex', alignItems:'center'}}>
                                                        <Icon name='x' size={13} color={dm?'#4a607f':'#94A3B8'} />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Approver grid */}
                                            {(() => {
                                                const filtered = approverSearch.trim()
                                                    ? approverList.filter(u => (u.name||u.email||'').toLowerCase().includes(approverSearch.toLowerCase()) || (u.role||'').toLowerCase().includes(approverSearch.toLowerCase()))
                                                    : approverList;
                                                return (
                                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:'8px', maxHeight:'260px', overflowY:'auto', paddingRight:'2px'}}>
                                                {filtered.length === 0 && (
                                                    <div style={{gridColumn:'1/-1', textAlign:'center', padding:'16px', fontSize:'12px', color:dm?'#4a607f':'#94A3B8'}}>
                                                        No approvers match "{approverSearch}"
                                                    </div>
                                                )}
                                                {filtered.map(u => {
                                                    const selected = formData.approver_ids.includes(u.id);
                                                    const initials = (u.name || u.email || '?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
                                                    // Generate a stable hue from the user id
                                                    const hues = ['#833089','#10B981','#F59E0B','#EF4444','#833089','#0EA5E9','#EC4899','#D97706'];
                                                    const hue  = hues[(u.id || 0) % hues.length];
                                                    return (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                approver_ids: selected
                                                                    ? prev.approver_ids.filter(id => id !== u.id)
                                                                    : [...prev.approver_ids, u.id]
                                                            }))}
                                                            style={{
                                                                position:'relative', display:'flex', flexDirection:'column',
                                                                alignItems:'center', gap:'6px', padding:'12px 8px',
                                                                borderRadius:'12px', cursor:'pointer', outline:'none',
                                                                border: selected ? `2px solid ${hue}` : '1.5px solid #E2E8F0',
                                                                background: selected ? `${hue}12` : (dm?'rgba(17,30,58,0.4)':'#FAFAFA'),
                                                                boxShadow: selected ? `0 2px 10px ${hue}25` : 'none',
                                                                transition:'all 0.15s ease',
                                                            }}
                                                        >
                                                            {/* Avatar */}
                                                            <div style={{
                                                                width:'40px', height:'40px', borderRadius:'50%', flexShrink:0,
                                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                                background: selected ? hue : `${hue}22`,
                                                                fontSize:'13px', fontWeight:700,
                                                                color: selected ? '#fff' : hue,
                                                                transition:'all 0.15s',
                                                            }}>{initials}</div>
                                                            {/* Name */}
                                                            <span style={{
                                                                fontSize:'11px', fontWeight: selected ? 700 : 500,
                                                                color: selected ? hue : (dm?'#8fa4cc':'#475569'),
                                                                textAlign:'center', lineHeight:1.3,
                                                                wordBreak:'break-word',
                                                            }}>{(u.name || u.email || '').split(' ')[0]}</span>
                                                            {/* Role */}
                                                            {u.role && <span style={{fontSize:'9px', color:dm?'#4a607f':'#94A3B8', textAlign:'center', lineHeight:1.2}}>{u.role}</span>}
                                                            {/* Selected tick badge */}
                                                            {selected && (
                                                                <div style={{
                                                                    position:'absolute', top:'5px', right:'5px',
                                                                    width:'15px', height:'15px', borderRadius:'50%',
                                                                    background:hue, display:'flex', alignItems:'center', justifyContent:'center',
                                                                }}>
                                                                    <Icon name='check' size={9} color='#fff' />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                                ); })()}
                                            {formData.approver_ids.length > 0 && (
                                                <p style={{fontSize:'11px', color:'#833089', fontWeight:600, marginTop:'8px'}}>
                                                    {formData.approver_ids.length} approver{formData.approver_ids.length > 1 ? 's' : ''} selected
                                                </p>
                                            )}
                                        </div>
                                        );
                                    })()}
                                </div>

                                {/* RIGHT COLUMN — sidebar (sticky on desktop, full-width on mobile) */}
                                <div style={{flex:'0 1 280px', minWidth:'240px', width:'100%', position:'sticky', top:'16px', alignSelf:'flex-start'}}>

                                    {/* Selected category summary card */}
                                    <div style={{
                                        borderRadius:'14px', marginBottom:'20px', overflow:'hidden',
                                        border: catVisual ? `1.5px solid ${catVisual.border||'#E2E8F0'}` : `1.5px solid ${dm?'rgba(109,39,115,0.16)':'#E2E8F0'}`,
                                        background: catVisual ? catVisual.bg : (dm?'rgba(17,30,58,0.6)':'#F8F9FB'),
                                        transition:'all 0.25s ease',
                                    }}>
                                        <div style={{padding:'16px 18px', display:'flex', alignItems:'center', gap:'12px'}}>
                                            <div style={{
                                                width:'46px', height:'46px', borderRadius:'11px', flexShrink:0,
                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                background: catVisual ? catVisual.color : (dm?'#1e2d4a':'#E2E8F0'),
                                                boxShadow: catVisual ? `0 4px 12px ${catVisual.color}40` : 'none',
                                                transition:'all 0.25s ease',
                                            }}>
                                                <Icon name={catVisual?.icon || 'folder'} size={22} color='#fff' />
                                            </div>
                                            <div style={{minWidth:0}}>
                                                <div style={{
                                                    fontSize:'13px', fontWeight:700, lineHeight:1.2,
                                                    color: catVisual ? catVisual.color : (dm?'#4a607f':'#94A3B8'),
                                                    transition:'color 0.2s',
                                                }}>
                                                    {catVisual ? catVisual.label : 'No category selected'}
                                                </div>
                                                <div style={{fontSize:'11px', color:dm?'#6b7280':'#64748B', marginTop:'3px', lineHeight:1.4}}>
                                                    {catVisual ? catVisual.desc : 'Pick one from the grid on the left.'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            height:'3px',
                                            background: catVisual ? `linear-gradient(90deg,${catVisual.color},${catVisual.color}55)` : (dm?'rgba(109,39,115,0.1)':'#E2E8F0'),
                                            transition:'background 0.25s ease',
                                        }}/>
                                    </div>

                                    {/* Classification */}
                                    <div className={cardCls}>
                                        <div className={sectionHeadCls}>
                                            <Icon name='tag' size={15} color={dm?'#C77DB8':'#6D2773'} /> Classification
                                        </div>
                                        <div className="mb-4">
                                            <label className={labelCls}>Priority <span className="text-red-400">*</span></label>
                                            <select name="priority_id" value={formData.priority_id} onChange={handleChange} className={inputCls}>
                                                <option value="">— Select priority —</option>
                                                {(lookups?.priorities || []).map(p => (
                                                    <option key={p.id} value={p.id}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Expected Completion <span className="text-red-400">*</span></label>
                                            <input type="date" name="expected_completion" value={formData.expected_completion} onChange={handleChange} required className={inputCls}/>
                                        </div>
                                    </div>

                                    {/* Assignment */}
                                    <div className={cardCls}>
                                        <div className={sectionHeadCls}>
                                            <Icon name='users' size={15} color={dm?'#C77DB8':'#6D2773'} /> Assignment
                                        </div>
                                        <div>
                                            <label className={labelCls}>Assign To <span className="text-red-400">*</span></label>
                                            <select
                                                value={formData.assigneeId || ''}
                                                onChange={e => {
                                                    const newAssigneeId = e.target.value ? Number(e.target.value) : null;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        assigneeId: newAssigneeId,
                                                        // Remove assignee from approver_ids if they were selected
                                                        approver_ids: newAssigneeId ? prev.approver_ids.filter(id => id !== newAssigneeId) : prev.approver_ids
                                                    }));
                                                }}
                                                className={inputCls}
                                            >
                                                <option value="">— Select assignee —</option>
                                                {(lookups?.users || [])
                                                    .filter(u => u.id !== Number(formData.created_by) && !(formData.approver_ids || []).includes(u.id))
                                                    .map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                                        style={{background: loading ? '#DDA8D1' : '#6D2773', boxShadow: loading ? 'none' : '0 2px 8px rgba(109,39,115,0.3)'}}
                                    >
                                        {loading ? <><YCLoader size={16} /><span style={{marginLeft:8}}>Creating ticket…</span></> : <span style={{display:'inline-flex',alignItems:'center',gap:6,justifyContent:'center'}}><Icon name='plus-circle' size={14} color='#fff' />Create Ticket</span>}
                                    </button>
                                </div>
                            </div>
                        </form>
                        )}
                    </div>
                </main>
            );
        });

        // Tickets Page
        const TicketsPage = React.memo(function TicketsPage() {
            const sessionUser = React.useMemo(() => getSessionUser(), []);
            const scopeParams = React.useMemo(() => getTicketScopeParams(sessionUser), []);

            // Human-readable scope label for the page header
            const scopeLabel = React.useMemo(() => {
                if (!sessionUser) return '';
                const { isBootstrapAdmin, positionType } = sessionUser;
                if (isBootstrapAdmin || positionType === 'director') return 'Viewing: All Tickets';
                if (['ops','finance','strategic'].includes(positionType))
                    return `Viewing: ${sessionUser.dept || 'Your Department'} Tickets`;
                if (scopeParams.scope === 'mine') return 'Viewing: Your Tickets';
                return '';
            }, []);


            const dm = useDark();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const cache = useTicketCache();
            const [staffList, setStaffList] = React.useState([]);
            const [filter, setFilter] = React.useState('all');
            const [search, setSearch] = React.useState('');
            const debouncedSearch = useDebounce(search, 150);
            const [currentPage, setCurrentPage] = React.useState(1);
            const [pageSize, setPageSize] = React.useState(25);
            const [priorityFilter, setPriorityFilter] = React.useState('');
            const [assigneeFilter, setAssigneeFilter] = React.useState('');
            const [dateFrom, setDateFrom] = React.useState('');
            const [dateTo, setDateTo]     = React.useState('');
            const [selectedTicket, setSelectedTicket] = React.useState(null);
            const [approvers, setApprovers] = React.useState([]);
            const [actionLoading, setActionLoading] = React.useState(false);
            const [actionError, setActionError] = React.useState('');
            const [closingTicketId, setClosingTicketId] = React.useState(null); // tracks inline-close in progress
            const [rejectMode, setRejectMode] = React.useState(false);
            const [reopenMode, setReopenMode] = React.useState(false);
            const [reopenJustification, setReopenJustification] = React.useState('');
            const [justification, setJustification] = React.useState('');
            const [acceptanceNote, setAcceptanceNote] = React.useState('');
            const [escalateMode, setEscalateMode] = React.useState(false);
            const [escalateTo, setEscalateTo] = React.useState('');
            const [escalateReason, setEscalateReason] = React.useState('');
            const [escalations, setEscalations] = React.useState([]);
            // Resolution note (required before Mark as Complete)
            const [resolutionNote, setResolutionNote] = React.useState('');
            // Extension request state
            const [extMode, setExtMode] = React.useState(false);
            const [extDate, setExtDate] = React.useState('');
            const [extNote, setExtNote] = React.useState('');
            // Extension response state
            const [extResNote, setExtResNote] = React.useState('');
            // Delete state
            const [deleteMode, setDeleteMode] = React.useState(false);
            const [deleteJustification, setDeleteJustification] = React.useState('');
            // Manage approvers state
            const [manageApproversMode, setManageApproversMode] = React.useState(false);
            const [pendingApproverIds, setPendingApproverIds] = React.useState([]);
            // Work notes / steps taken state
            const [workNote, setWorkNote] = React.useState('');
            const [workNoteLoading, setWorkNoteLoading] = React.useState(false);
            // Drawer attachment upload state
            const [attUploadLoading, setAttUploadLoading] = React.useState(false);
            const [attUploadError, setAttUploadError] = React.useState('');

            // Map API status IDs to display labels
            const toStatusLabel = s => ({ open:'Open', new:'New', in_progress:'In Progress', pending_approval:'Pending Approval', resolved:'Resolved', closed:'Closed', waiting:'Waiting', assigned:'Assigned' })[s] || (s||'').replace(/_/g,' ');
            const toPriorityLabel = p => ({ critical:'Critical', high:'High', medium:'Medium', low:'Low' })[p] || p;

            // Normalise an API ticket to the display shape the rest of the component uses
            const normalise = t => ({
                ...t,
                _dbId: t.id,
                id: t.ticketNumber || `#${t.id}`,
                title: t.title || '',
                category: t.categoryLabel || t.category || '',
                priority: toPriorityLabel(t.priorityLabel || t.priority || ''),
                status: toStatusLabel(t.statusLabel || t.status || ''),
                assigned: t.assigneeName || 'Unassigned',
                date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-AU', {day:'numeric',month:'short',year:'numeric'}) : '',
                isEscalated: !!t.isEscalated,
                // Carry through pending approver IDs for tab filtering
                pendingApproverIds: Array.isArray(t.pendingApproverIds) ? t.pendingApproverIds : [],
            });
            // Seed from global cache — page renders instantly without waiting for its own fetch
            const [tickets, setTickets] = React.useState(() => cache.ready ? cache.tickets.map(normalise) : []);
            const [ticketsLoading, setTicketsLoading] = React.useState(() => !cache.ready);

            React.useEffect(() => {
                // Always fetch staff; fetch tickets only if cache wasn't ready (cold load)
                const ticketFetch = cache.ready
                    ? Promise.resolve({ tickets: cache.tickets })
                    : API.tickets.getAll({ all: true, limit: 500 }).catch(() => ({ tickets: [] }));
                Promise.all([
                    ticketFetch,
                    fetch(`${HRMS_API}/users?status=active&limit=200`, { credentials:'include', headers: authHeaders() }).then(r => r.ok ? r.json() : { users: [] }).catch(() => ({ users: [] }))
                ]).then(([tickData, staffData]) => {
                    setTickets((tickData.tickets || []).map(normalise));
                    setStaffList(staffData.users || []);
                }).finally(() => setTicketsLoading(false));
            }, []);

            const refreshTicket = async (dbId) => {
                try {
                    const data = await API.tickets.getById(dbId);
                    if (data.ticket) {
                        // Ensure pendingApproverIds is always populated from live approvers
                        if (!data.ticket.pendingApproverIds || data.ticket.pendingApproverIds.length === 0) {
                            data.ticket.pendingApproverIds = (data.ticket.approvers || [])
                                .filter(a => (a.status || '').toLowerCase() === 'pending')
                                .map(a => a.userId);
                        }
                        const updated = normalise(data.ticket);
                        setTickets(prev => prev.map(t => t._dbId === dbId ? updated : t));
                        setSelectedTicket(updated);
                        if (data.ticket.approvers) setApprovers(data.ticket.approvers);
                    }
                } catch(_) {}
            };

            // Listen for notification-click → open ticket drawer
            React.useEffect(() => {
                const handler = async (e) => {
                    const { ticketId } = e.detail || {};
                    if (!ticketId) return;
                    // Try to find in already-loaded tickets first
                    setTickets(prev => {
                        const found = prev.find(t => t._dbId === Number(ticketId));
                        if (found) {
                            setSelectedTicket(found);
                        } else {
                            // Not loaded yet — fetch directly
                            API.tickets.getById(Number(ticketId)).then(data => {
                                if (data.ticket) {
                                    if (!data.ticket.pendingApproverIds?.length) {
                                        data.ticket.pendingApproverIds = (data.ticket.approvers || [])
                                            .filter(a => (a.status || '').toLowerCase() === 'pending')
                                            .map(a => a.userId);
                                    }
                                    setSelectedTicket(normalise(data.ticket));
                                    if (data.ticket.approvers) setApprovers(data.ticket.approvers);
                                }
                            }).catch(() => {});
                        }
                        return prev;
                    });
                };
                window.addEventListener('yc:open-ticket', handler);
                return () => window.removeEventListener('yc:open-ticket', handler);
            }, []);

            const filtered = tickets.filter(t => {
                if (filter !== 'all' && t.status.toLowerCase() !== filter.toLowerCase()) return false;
                if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
                return true;
            });

            const getStatusBadge = (status) => {
                const badges = {
                    'Open': 'badge-open',
                    'In Progress': 'badge-in-progress',
                    'Resolved': 'badge-resolved',
                    'Closed': 'badge-closed'
                };
                return badges[status] || 'badge-open';
            };

            const getPriorityBadge = (priority) => {
                const badges = {
                    'Urgent': 'badge-urgent',
                    'High': 'badge-high',
                    'Medium': 'badge-medium',
                    'Low': 'badge-low'
                };
                return badges[priority] || 'badge-medium';
            };

            // ── Inline badge style helpers ────────────────────────
            const STATUS_ST = {
                'New':              {bg:'#F6ECF4',color:'#5D2162',border:'#E3BFDA'},
                'Open':             {bg:'#E0F2FE',color:'#0369A1',border:'#BAE6FD'},
                'In Progress':      {bg:'#FFFBEB',color:'#B45309',border:'#FDE68A'},
                'Waiting':          {bg:'#F5F3FF',color:'#6D2773',border:'#DDD6FE'},
                'Pending Approval': {bg:'#FFF7ED',color:'#C2410C',border:'#FED7AA'},
                'Resolved':         {bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'},
                'Closed':           {bg:'#F1F5F9',color:'#475569',border:'#CBD5E1'},
                'Assigned':         {bg:'#DBEAFE',color:dm?'#93c5fd':'#1E40AF',border:'#BFDBFE'},
            };
            const PRI_ST = {
                'Critical': {bg:'#FEF2F2',color:'#991B1B',border:'#FECACA',dot:'#EF4444'},
                'Urgent':   {bg:'#FEF2F2',color:'#991B1B',border:'#FECACA',dot:'#EF4444'},
                'High':     {bg:'#FFFBEB',color:'#92400E',border:'#FDE68A',dot:'#F59E0B'},
                'Medium':   {bg:'#EFF6FF',color:'#1E40AF',border:'#BFDBFE',dot:'#3B82F6'},
                'Low':      {bg:'#F0FDF4',color:'#166534',border:'#BBF7D0',dot:'#22C55E'},
            };
            const PRI_LEFT = {'Critical':'#EF4444','Urgent':'#EF4444','High':'#F59E0B','Medium':'#3B82F6','Low':'#22C55E'};
            const sst = s => STATUS_ST[s] || {bg:'#F3F4F6',color:dm?'#c0cfec':'#334155',border:dm?'rgba(109,39,115,0.16)':'#E2E8F2'};
            const pst = p => PRI_ST[p]   || {bg:'#F3F4F6',color:dm?'#c0cfec':'#334155',border:dm?'rgba(109,39,115,0.16)':'#E2E8F2',dot:dm?'#4a607f':'#94A3B8'};
            const Badge = ({text, st}) => (
                <span style={{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,padding:'2px 9px',borderRadius:20,background:st.bg,color:st.color,border:`1px solid ${st.border}`,whiteSpace:'nowrap'}}>{text}</span>
            );
            const now2 = new Date();
            const isOD = t => !['Resolved','Closed'].includes(t.status) && (t.dueAt||t.expectedCompletion) && new Date(t.dueAt||t.expectedCompletion)<now2;
            const fmtDue = t => {
                const raw = t.dueAt||t.expectedCompletion; if(!raw) return null;
                return new Date(raw).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
            };

            // Status filter counts
            const STATUS_GROUPS = [
                {key:'all',            label:'All',                match: ()=>true},
                {key:'mine',           label:'Assigned to Me',     match: t=>t.assigneeId!=null && Number(t.assigneeId)===Number(sessionUser?.id), color:'#833089'},
                {key:'my_approvals',   label:'Pending My Approval',match: t=>t.status==='Pending Approval' && (t.pendingApproverIds||[]).map(Number).includes(Number(sessionUser?.id)), color:'#D97706'},
                {key:'ready_to_close', label:'Pending Closure',     match: t=>t.status==='Resolved' && Number(t.requesterId)===Number(sessionUser?.id), color:'#059669'},
                {key:'open',           label:'New / Open',         match: t=>['New','Open','Assigned'].includes(t.status)},
                {key:'in_progress',    label:'In Progress',        match: t=>['In Progress','Waiting'].includes(t.status)},
                {key:'pending',        label:'Pending Approval',   match: t=>t.status==='Pending Approval'},
                {key:'resolved',       label:'Resolved',           match: t=>t.status==='Resolved'},
                {key:'closed',         label:'Closed',             match: t=>t.status==='Closed'},
                {key:'overdue',        label:'Overdue',            match: t=>isOD(t)},
            ];
            const uniqueAssignees = React.useMemo(() => {
                const seen = new Set();
                tickets.forEach(t => { if (t.assigned && t.assigned !== 'Unassigned') seen.add(t.assigned); });
                return [...seen].sort();
            }, [tickets]);

            const hasActiveFilters = priorityFilter || assigneeFilter || dateFrom || dateTo;
            const clearFilters = () => { setPriorityFilter(''); setAssigneeFilter(''); setDateFrom(''); setDateTo(''); };

            const filteredNew = React.useMemo(() => {
                const grp = STATUS_GROUPS.find(g=>g.key===filter);
                const searchL = debouncedSearch.toLowerCase();
                const priorityL = priorityFilter.toLowerCase();
                const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;
                const dateToMs   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;
                return tickets.filter(t => {
                    if (grp && !grp.match(t)) return false;
                    if (debouncedSearch && !t.title.toLowerCase().includes(searchL) && !t.id.toLowerCase().includes(searchL)) return false;
                    if (priorityFilter && (t.priority||'').toLowerCase() !== priorityL) return false;
                    if (assigneeFilter && (t.assigned||'') !== assigneeFilter) return false;
                    const createdMs = t.createdAt ? new Date(t.createdAt).getTime() : null;
                    if (dateFromMs && !(createdMs && createdMs >= dateFromMs)) return false;
                    if (dateToMs   && !(createdMs && createdMs <= dateToMs))   return false;
                    return true;
                });
            }, [tickets, filter, debouncedSearch, priorityFilter, assigneeFilter, dateFrom, dateTo]);

            // Reset pagination when filters change
            React.useEffect(() => { setCurrentPage(1); }, [filter, debouncedSearch, priorityFilter, assigneeFilter, dateFrom, dateTo]);

            const totalPages = Math.max(1, Math.ceil(filteredNew.length / pageSize));
            const safePage   = Math.min(currentPage, totalPages);
            const pageStart  = (safePage - 1) * pageSize;
            const visibleTickets = filteredNew.slice(pageStart, pageStart + pageSize);

            return (
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    <div style={{maxWidth:'1400px',margin:'0 auto',padding:'24px'}}>

                        {/* ── Header ── */}
                        <div className='yc-toolbar' style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px',flexWrap:'wrap',gap:'10px'}}>
                            <div>
                                <h1 style={{fontSize:'20px',fontWeight:'700',color:textP,margin:0}}>Tickets</h1>
                                <p style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',margin:'3px 0 0',display:'flex',alignItems:'center',gap:'5px'}}>
                                    {scopeLabel
                                        ? <><Icon name='ticket' size={13} color={dm?'#833089':'#833089'} />{scopeLabel}</>
                                        : <><Icon name='clipboard-list' size={13} color={dm?'#4a607f':'#94A3B8'} />Manage and track support tickets</>
                                    }
                                </p>
                            </div>
                            <button onClick={()=>{ window.location.hash='create-ticket'; }}
                                style={{display:'flex',alignItems:'center',gap:'6px',background:'#833089',color:'white',border:'none',borderRadius:'9px',padding:'9px 18px',fontSize:'13px',fontWeight:'600',cursor:'pointer',boxShadow:'0 1px 4px rgba(109,39,115,0.35)'}}>
                                <Icon name='plus-circle' size={14} color='#fff' />New Ticket
                            </button>
                        </div>

                        {/* ── Status filter tabs — two-group professional layout ── */}
                        {(()=>{
                            const MY_QUEUE   = ['all','mine','my_approvals','ready_to_close'];
                            const BY_STATUS  = ['open','in_progress','pending','resolved','closed','overdue'];
                            const TAB_ICONS = {
                                all:'clipboard-list', mine:'user', my_approvals:'bell', ready_to_close:'lock',
                                open:'inbox', in_progress:'loader', pending:'hourglass', resolved:'check-circle', closed:'lock', overdue:'alert-triangle'
                            };
                            const renderTab  = (g) => {
                                const cnt = g.key==='all' ? tickets.length : tickets.filter(g.match).length;
                                const active = filter===g.key;
                                const isMyApprovals  = g.key==='my_approvals';
                                const isRTC          = g.key==='ready_to_close';
                                const isOverdue      = g.key==='overdue';
                                const hasAlert       = (isMyApprovals||isRTC) && cnt>0;
                                const accentColor    = isMyApprovals ? '#D97706' : isRTC ? '#059669' : isOverdue ? '#DC2626' : '#833089';
                                const bg   = active ? accentColor : hasAlert ? (dm?`rgba(${isMyApprovals?'217,119,6':'5,150,105'},0.1)`:(isMyApprovals?'#FFFBEB':'#ECFDF5')) : 'transparent';
                                const border= active ? accentColor : hasAlert ? (isMyApprovals?'#FDE68A':'#6EE7B7') : (dm?'rgba(109,39,115,0.12)':'#E5E7EB');
                                const color = active ? 'white' : hasAlert ? (dm?(isMyApprovals?'#fcd34d':'#34d399'):(isMyApprovals?'#92400E':'#065F46')) : (dm?'#8fa4cc':'#64748B');
                                const badge_bg = active?'rgba(255,255,255,0.22)':hasAlert?(dm?`rgba(${isMyApprovals?'217,119,6':'5,150,105'},0.18)`:isMyApprovals?'#FEF3C7':'#D1FAE5'):(dm?'rgba(109,39,115,0.1)':'#EEF2F8');
                                const badge_color = active?'white':hasAlert?(dm?(isMyApprovals?'#fcd34d':'#34d399'):(isMyApprovals?'#92400E':'#065F46')):(dm?'#6b80a4':'#94A3B8');
                                const iconColor = active ? 'white' : hasAlert ? (dm?(isMyApprovals?'#fcd34d':'#34d399'):(isMyApprovals?'#92400E':'#065F46')) : isOverdue ? '#DC2626' : (dm?'#8fa4cc':'#64748B');
                                return (
                                    <button key={g.key} onClick={()=>setFilter(g.key)}
                                        style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'5px 11px',borderRadius:'7px',border:`1px solid ${border}`,fontSize:'11.5px',fontWeight:'600',cursor:'pointer',transition:'all 0.15s',flexShrink:0,whiteSpace:'nowrap',background:bg,color,
                                            boxShadow:active?`0 1px 4px ${accentColor}44`:'none'}}>
                                        <Icon name={TAB_ICONS[g.key]||'clipboard-list'} size={11} color={iconColor} />
                                        {g.label}
                                        <span style={{fontSize:'10px',fontWeight:'700',borderRadius:'10px',padding:'1px 5px',minWidth:'16px',textAlign:'center',background:badge_bg,color:badge_color}}>{cnt}</span>
                                    </button>
                                );
                            };
                            const groupWrap = (label, keys, borderColor) => (
                                <div style={{display:'flex',alignItems:'center',gap:'4px',background:dm?'rgba(2,6,16,0.35)':'#F8FAFF',border:`1px solid ${dm?'rgba(109,39,115,0.1)':borderColor||'#EEF2F8'}`,borderRadius:'10px',padding:'4px 6px'}}>
                                    <span style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',paddingRight:'6px',borderRight:`1px solid ${dm?'rgba(109,39,115,0.12)':'#E5E7EB'}`,marginRight:'2px',whiteSpace:'nowrap'}}>{label}</span>
                                    {STATUS_GROUPS.filter(g=>keys.includes(g.key)).map(renderTab)}
                                </div>
                            );
                            return (
                                <div className='yc-toolbar-filters' style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
                                    {groupWrap('My Queue', MY_QUEUE)}
                                    <div style={{width:'1px',height:'28px',background:dm?'rgba(109,39,115,0.15)':'#E5E7EB',flexShrink:0}}/>
                                    {groupWrap('By Status', BY_STATUS)}
                                </div>
                            );
                        })()}

                        {/* ── Search + table card ── */}
                        <div style={{background:cardBg,borderRadius:'14px',border:`1px solid ${borderC}`,overflow:'hidden',boxShadow:dm?'0 4px 6px rgba(0,0,0,0.4),0 16px 48px rgba(0,0,0,0.55),0 1px 0 rgba(255,255,255,0.04) inset':'0 1px 4px rgba(0,0,0,0.05)'}}>

                            {/* Search + filter bar */}
                            <div style={{padding:'12px 16px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`,display:'flex',flexWrap:'wrap',gap:'8px',alignItems:'center'}}>
                                {/* Search input */}
                                <div style={{display:'flex',alignItems:'center',gap:'8px',flex:'1 1 220px',minWidth:'180px',background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',border:`1px solid ${dm?'rgba(109,39,115,0.14)':'#E2E8F2'}`,borderRadius:'8px',padding:'6px 10px'}}>
                                    <Icon name='search' size={14} color={dm?'#4a607f':'#94A3B8'} />
                                    <input type="text" placeholder="Search by title or ticket ID…" value={search} onChange={e=>setSearch(e.target.value)}
                                        style={{flex:1,border:'none',outline:'none',fontSize:'12.5px',color:dm?'#c0cfec':'#334155',background:'transparent',minWidth:0}}/>
                                    {search && <button onClick={()=>setSearch('')} style={{border:'none',background:'none',color:dm?'#4a607f':'#94A3B8',cursor:'pointer',padding:'0',display:'flex',alignItems:'center',flexShrink:0}}><Icon name='x' size={14} color={dm?'#4a607f':'#94A3B8'} /></button>}
                                </div>
                                {/* Priority */}
                                <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}
                                    style={{flex:'0 1 130px',minWidth:'110px',border:`1px solid ${priorityFilter?'#833089':(dm?'rgba(109,39,115,0.14)':'#E2E8F2')}`,borderRadius:'8px',padding:'6px 10px',fontSize:'12px',background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:priorityFilter?(dm?'#DDA8D1':'#6D2773'):(dm?'#8fa4cc':'#64748B'),outline:'none',cursor:'pointer'}}>
                                    <option value="">All Priorities</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                {/* Assignee */}
                                <select value={assigneeFilter} onChange={e=>setAssigneeFilter(e.target.value)}
                                    style={{flex:'0 1 160px',minWidth:'130px',border:`1px solid ${assigneeFilter?'#833089':(dm?'rgba(109,39,115,0.14)':'#E2E8F2')}`,borderRadius:'8px',padding:'6px 10px',fontSize:'12px',background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:assigneeFilter?(dm?'#DDA8D1':'#6D2773'):(dm?'#8fa4cc':'#64748B'),outline:'none',cursor:'pointer'}}>
                                    <option value="">All Assignees</option>
                                    {uniqueAssignees.map(a=><option key={a} value={a}>{a}</option>)}
                                </select>
                                {/* Date From */}
                                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} title="Created from"
                                    style={{flex:'0 1 130px',minWidth:'110px',border:`1px solid ${dateFrom?'#833089':(dm?'rgba(109,39,115,0.14)':'#E2E8F2')}`,borderRadius:'8px',padding:'6px 10px',fontSize:'12px',background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:dateFrom?(dm?'#DDA8D1':'#6D2773'):(dm?'#8fa4cc':'#64748B'),outline:'none',colorScheme:dm?'dark':'light'}}/>
                                {/* Date To */}
                                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} title="Created to"
                                    style={{flex:'0 1 130px',minWidth:'110px',border:`1px solid ${dateTo?'#833089':(dm?'rgba(109,39,115,0.14)':'#E2E8F2')}`,borderRadius:'8px',padding:'6px 10px',fontSize:'12px',background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:dateTo?(dm?'#DDA8D1':'#6D2773'):(dm?'#8fa4cc':'#64748B'),outline:'none',colorScheme:dm?'dark':'light'}}/>
                                {/* Clear + count */}
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} style={{border:'none',background:'none',color:dm?'#DDA8D1':'#833089',cursor:'pointer',fontSize:'12px',fontWeight:'600',padding:'6px 4px',flexShrink:0,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:4}}><Icon name='x' size={12} color={dm?'#DDA8D1':'#833089'} />Clear</button>
                                )}
                                <span style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',marginLeft:'auto',whiteSpace:'nowrap',flexShrink:0}}>{filteredNew.length} ticket{filteredNew.length!==1?'s':''}</span>
                            </div>

                            {/* Table */}
                            {ticketsLoading ? (
                                <div style={{padding:'60px 24px',display:'flex',alignItems:'center',justifyContent:'center'}}><SectionLoader message="Loading tickets…" /></div>
                            ) : filteredNew.length === 0 ? (
                                <div style={{padding:'60px',textAlign:'center'}}>
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='ticket' size={40} color={dm?'#4a607f':'#CBD5E1'} /></div>
                                    <p style={{fontSize:'14px',fontWeight:'600',color:dm?'#c0cfec':'#334155',margin:'0 0 4px'}}>No tickets found</p>
                                    <p style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',margin:0}}>Try adjusting your filters or search term</p>
                                </div>
                            ) : (
                                <React.Fragment>
                                <div className="yc-table-scroll">
                                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                                        <thead>
                                            <tr style={{background:dm?'rgba(2,6,16,0.4)':'#F8FAFF',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                                {['Ticket ID','Title','Category','Priority','Status','Assigned To','Due Date','Created',...(filter==='ready_to_close'?['Action']:[])].map(h=>(
                                                    <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:'11px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleTickets.map((t,i)=>{
                                                const ps = pst(t.priority);
                                                const ss = sst(t.status);
                                                const od = isOD(t);
                                                const dueStr = fmtDue(t);
                                                const initials = (t.assigned||'?').split(/\s+/).map(w=>w[0]||'').slice(0,2).join('').toUpperCase();
                                                const leftColor = PRI_LEFT[t.priority]||'#E5E7EB';
                                                return (
                                                    <tr key={t._dbId||t.id}
                                                        style={{borderBottom:`1px solid ${dm?'rgba(109,39,115,0.10)':'#EEF2F8'}`,cursor:'pointer',transition:'background 0.1s'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='#F8F9FF'}
                                                        onMouseLeave={e=>e.currentTarget.style.background=''}
                                                        onClick={async()=>{
                                                            setSelectedTicket(t);
                                                            setRejectMode(false); setReopenMode(false); setReopenJustification(''); setJustification(''); setActionError('');
                                                            setEscalateMode(false); setEscalateTo(''); setEscalateReason('');
                                                            setExtMode(false); setExtDate(''); setExtNote(''); setExtResNote('');
                                                            setDeleteMode(false); setDeleteJustification('');
                                                            setResolutionNote('');
                                                            setApprovers([]); setEscalations([]);
                                                            if(t._dbId){
                                                                try {
                                                                    const [ticketData,escData] = await Promise.all([
                                                                        API.tickets.getById(t._dbId),
                                                                        API.tickets.getEscalations(t._dbId).catch(()=>({escalations:[]}))
                                                                    ]);
                                                                    // Update selectedTicket with full data (includes comments, attachments, subcategory, etc.)
                                                                    if(ticketData.ticket) setSelectedTicket(normalise(ticketData.ticket));
                                                                    if(ticketData.ticket?.approvers) setApprovers(ticketData.ticket.approvers);
                                                                    if(escData.escalations) setEscalations(escData.escalations);
                                                                } catch(_){}
                                                            }
                                                        }}>
                                                        {/* Priority left-stripe via box-shadow on first cell */}
                                                        <td style={{padding:'12px 14px',fontSize:'12px',fontWeight:'700',color:dm?'#C77DB8':'#6D2773',whiteSpace:'nowrap',borderLeft:`3px solid ${leftColor}`}}>{t.id}</td>
                                                        <td style={{padding:'12px 14px',maxWidth:'280px'}}>
                                                            <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                                <span style={{fontSize:'13px',fontWeight:'600',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'220px'}}>{t.title}</span>
                                                                {t.isEscalated && <span style={{fontSize:'10px',fontWeight:'700',padding:'1px 7px',borderRadius:20,background:dm?'rgba(249,115,22,0.15)':'#FFF7ED',color:dm?'#fdba74':'#C2410C',border:`1px solid ${dm?'rgba(249,115,22,0.3)':'#FED7AA'}`,flexShrink:0,display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='arrow-up-circle' size={10} color={dm?'#fdba74':'#C2410C'} />Escalated</span>}
                                                                {od && <span style={{fontSize:'10px',fontWeight:'700',padding:'1px 7px',borderRadius:20,background:dm?'rgba(239,68,68,0.15)':'#FEF2F2',color:dm?'#fca5a5':'#991B1B',border:'1px solid #FECACA',flexShrink:0}}>Overdue</span>}
                                                            </div>
                                                            {t.category && <div style={{marginTop:'4px'}}><CatBadge label={t.categoryLabel||t.category} /></div>}
                                                        </td>
                                                        <td style={{padding:'12px 14px'}}><CatBadge label={t.categoryLabel||t.category} /></td>
                                                        <td style={{padding:'12px 14px'}}>
                                                            <span style={{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:ps.bg,color:ps.color,border:`1px solid ${ps.border}`}}>
                                                                <span style={{width:6,height:6,borderRadius:'50%',background:ps.dot,flexShrink:0}}/>
                                                                {t.priority}
                                                            </span>
                                                        </td>
                                                        <td style={{padding:'12px 14px'}}>
                                                            <Badge text={t.status} st={ss}/>
                                                        </td>
                                                        <td style={{padding:'12px 14px'}}>
                                                            {t.assigned==='Unassigned' ? (
                                                                <span style={{fontSize:12,color:dm?'#4a607f':'#94A3B8',fontStyle:'italic'}}>Unassigned</span>
                                                            ) : (
                                                                <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                                                                    <div style={{width:24,height:24,borderRadius:'50%',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:dm?'#C77DB8':'#6D2773',flexShrink:0}}>{initials}</div>
                                                                    <span style={{fontSize:12,color:dm?'#c0cfec':'#334155',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'120px'}}>{t.assigned}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{padding:'12px 14px',fontSize:12,color:od?'#EF4444':(dm?'#8fa4cc':'#64748B'),fontWeight:od?700:400,whiteSpace:'nowrap'}}>
                                                            {dueStr || <span style={{color:'#D1D5DB'}}>—</span>}
                                                        </td>
                                                        <td style={{padding:'12px 14px',fontSize:12,color:dm?'#4a607f':'#94A3B8',whiteSpace:'nowrap'}}>{t.date}</td>
                                                        {filter==='ready_to_close' && (
                                                            <td style={{padding:'12px 14px',whiteSpace:'nowrap'}} onClick={e=>e.stopPropagation()}>
                                                                <button
                                                                    disabled={closingTicketId===t._dbId}
                                                                    onClick={async()=>{
                                                                        setClosingTicketId(t._dbId);
                                                                        setActionError('');
                                                                        try {
                                                                            await API.tickets.close(t._dbId);
                                                                            setTickets(prev=>prev.map(x=>x._dbId===t._dbId ? {...x, status:'Closed', isClosed:true} : x));
                                                                        } catch(err) {
                                                                            setActionError('Failed to close ticket. Please try again.');
                                                                        } finally {
                                                                            setClosingTicketId(null);
                                                                        }
                                                                    }}
                                                                    style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'5px 12px',borderRadius:'7px',border:'1px solid #059669',background:closingTicketId===t._dbId?'#D1FAE5':'#059669',color:closingTicketId===t._dbId?'#065F46':'white',fontSize:'12px',fontWeight:'600',cursor:closingTicketId===t._dbId?'wait':'pointer',transition:'all 0.15s',opacity:closingTicketId===t._dbId?0.7:1}}
                                                                >
                                                                    {closingTicketId===t._dbId ? <><YCLoader size={12} />Closing…</> : <><Icon name='lock' size={12} color='#fff' />Close</>}
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* ── Pagination bar ── */}
                                {(()=>{
                                    const pg = safePage;
                                    const btn = (label, onClick, disabled, active=false) => (
                                        <button key={label} onClick={onClick} disabled={disabled}
                                            style={{minWidth:32,height:32,padding:'0 6px',borderRadius:6,border:`1px solid ${active?(dm?'#833089':'#833089'):dm?'rgba(255,255,255,0.08)':'#E2E8F2'}`,background:active?(dm?'#833089':'#833089'):(dm?'rgba(255,255,255,0.04)':'#fff'),color:active?'#fff':disabled?(dm?'#3a4f6a':'#CBD5E1'):(dm?'#DDA8D1':'#4B5563'),fontSize:13,fontWeight:active?700:500,cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s'}}>
                                            {label}
                                        </button>
                                    );
                                    // page window: always show first, last, current±1, with ellipsis
                                    const pages = [];
                                    const addPage = n => { if(n>=1&&n<=totalPages&&!pages.includes(n)) pages.push(n); };
                                    addPage(1); addPage(totalPages);
                                    for(let i=pg-1;i<=pg+1;i++) addPage(i);
                                    pages.sort((a,b)=>a-b);
                                    const pageButtons = [];
                                    let prev = 0;
                                    for(const p of pages){
                                        if(p-prev>1) pageButtons.push(<span key={`e${p}`} style={{color:dm?'#4a607f':'#94A3B8',fontSize:13,padding:'0 2px'}}>…</span>);
                                        pageButtons.push(btn(p, ()=>setCurrentPage(p), false, p===pg));
                                        prev=p;
                                    }
                                    return (
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,padding:'14px 16px 6px',borderTop:`1px solid ${dm?'rgba(255,255,255,0.06)':'#F1F5FB'}`}}>
                                            {/* Left: result count */}
                                            <span style={{fontSize:12.5,color:dm?'#4a607f':'#94A3B8',flexShrink:0}}>
                                                {filteredNew.length === 0 ? 'No results' : `Showing ${pageStart+1}–${Math.min(pageStart+pageSize,filteredNew.length)} of ${filteredNew.length} ticket${filteredNew.length!==1?'s':''}`}
                                            </span>
                                            {/* Centre: page buttons */}
                                            <div style={{display:'flex',alignItems:'center',gap:4}}>
                                                {btn('‹ Prev', ()=>setCurrentPage(p=>Math.max(1,p-1)), pg===1)}
                                                {pageButtons}
                                                {btn('Next ›', ()=>setCurrentPage(p=>Math.min(totalPages,p+1)), pg===totalPages)}
                                            </div>
                                            {/* Right: page size */}
                                            <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                                                <span style={{fontSize:12.5,color:dm?'#4a607f':'#94A3B8'}}>Rows</span>
                                                <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setCurrentPage(1);}}
                                                    style={{fontSize:12.5,padding:'3px 6px',borderRadius:6,border:`1px solid ${dm?'rgba(255,255,255,0.1)':'#E2E8F2'}`,background:dm?'#131c2e':'#fff',color:dm?'#DDA8D1':'#374151',cursor:'pointer'}}>
                                                    {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })()}
                                </React.Fragment>
                            )}
                        </div>
                    </div>

                    {/* ── Ticket Detail Drawer ── */}
                    {selectedTicket && (()=>{
                        const closeDrawer = () => {
                            setSelectedTicket(null); setRejectMode(false); setReopenMode(false); setReopenJustification(''); setJustification(''); setAcceptanceNote(''); setActionError('');
                            setEscalateMode(false); setEscalateTo(''); setEscalateReason(''); setEscalations([]);
                            setExtMode(false); setExtDate(''); setExtNote(''); setExtResNote('');
                            setDeleteMode(false); setDeleteJustification('');
                            setManageApproversMode(false); setPendingApproverIds([]);
                            setReopenMode(false); setReopenJustification('');
                            setResolutionNote(''); setWorkNote(''); setAttUploadError('');
                        };
                        const isAssignee   = selectedTicket.assigneeId != null && Number(selectedTicket.assigneeId) === Number(sessionUser?.id);
                        const isCreator    = selectedTicket.requesterId != null && Number(selectedTicket.requesterId) === Number(sessionUser?.id);
                        const isBootAdmin  = sessionUser?.isBootstrapAdmin === true;
                        // isApprover: user has a PENDING decision (can approve/reject)
                        const isApprover   = approvers.some(ap => Number(ap.userId) === Number(sessionUser?.id) && (ap.status||'').toLowerCase() === 'pending');
                        // isAnyApprover: user is assigned as approver regardless of current decision status (can reopen resolved tickets)
                        const isAnyApprover = approvers.some(ap => Number(ap.userId) === Number(sessionUser?.id));
                        const hasPendingExt = selectedTicket.extensionRequestStatus === 'pending';
                        return (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'flex-start',justifyContent:'flex-end',zIndex:50}}
                            onClick={e=>{if(e.target===e.currentTarget) closeDrawer();}}>
                            <div style={{background:cardBg,width:'100%',maxWidth:'520px',height:'100vh',overflowY:'auto',display:'flex',flexDirection:'column',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)'}}>

                                {/* Header band */}
                                {(()=>{
                                    const ps = pst(selectedTicket.priority);
                                    return (
                                        <div style={{background:ps.bg,borderBottom:`3px solid ${ps.dot}`,padding:'20px 20px 16px',position:'sticky',top:0,zIndex:1}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                                                <div style={{flex:1,minWidth:0,paddingRight:'12px'}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap'}}>
                                                        <span style={{fontSize:11,fontWeight:700,color:ps.color,background:cardBg,borderRadius:6,padding:'2px 8px',border:`1px solid ${ps.border}`}}>{selectedTicket.id}</span>
                                                        <Badge text={selectedTicket.status} st={sst(selectedTicket.status)}/>
                                                        {selectedTicket.isEscalated && <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#FFF7ED',color:'#C2410C',border:'1px solid #FED7AA',display:'inline-flex',alignItems:'center',gap:3}}><Icon name='trending-up' size={9} color='#C2410C' />Escalated</span>}
                                                        {hasPendingExt && <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#FFF7ED',color:'#92400E',border:'1px solid #FDE68A'}}>⏳ Extension Requested</span>}
                                                    </div>
                                                    <h2 style={{fontSize:'15px',fontWeight:'700',color:textP,margin:0,lineHeight:1.3}}>{selectedTicket.title}</h2>
                                                    {selectedTicket.category && <div style={{margin:'6px 0 0'}}><CatBadge label={selectedTicket.categoryLabel||selectedTicket.category} size='lg' /></div>}
                                                </div>
                                                <button onClick={closeDrawer}
                                                    style={{background:dm?'rgba(109,39,115,0.08)':'white',border:`1px solid ${borderC}`,borderRadius:'8px',width:32,height:32,cursor:'pointer',color:textM,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name='x' size={16} color={textM} /></button>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div style={{padding:'20px',flex:1}}>
                                    {/* ── Full detail grid ── */}
                                    {(()=>{
                                        const raw = selectedTicket.dueAt||selectedTicket.expectedCompletion;
                                        const od  = isOD(selectedTicket);
                                        // Derive ticket type / subject from stored fields or split from combined title
                                        const rawTitle = selectedTicket.title || '';
                                        const titleParts = rawTitle.includes(' — ') ? rawTitle.split(' — ') : [rawTitle, ''];
                                        const ticketType = selectedTicket.titleType || titleParts[0] || '—';
                                        const ticketSubject = selectedTicket.subtitle || titleParts.slice(1).join(' — ') || '—';
                                        const metaItems = [
                                            {label:'Priority',    node: <Badge text={selectedTicket.priority} st={pst(selectedTicket.priority)}/>},
                                            {label:'Status',      node: <Badge text={selectedTicket.status}   st={sst(selectedTicket.status)}/>},
                                            {label:'Ticket Type', node: <span style={{fontSize:13,color:textP,fontWeight:500}}>{ticketType}</span>},
                                            {label:'Subject',     node: <span style={{fontSize:13,color:textP}}>{ticketSubject}</span>},
                                            {label:'Assigned To', node: <div>
                                                <span style={{fontSize:13,color:textP,fontWeight:500,display:'block'}}>{selectedTicket.assigned||'Unassigned'}{selectedTicket.assigneeActive===false && <ExStaffBadge />}</span>
                                                {selectedTicket.assigneeEmail && <span style={{fontSize:11,color:textM}}>{selectedTicket.assigneeEmail}</span>}
                                            </div>},
                                            {label:'Reported By', node: <div>
                                                <span style={{fontSize:13,color:textP,fontWeight:500,display:'block'}}>{selectedTicket.requesterName||'—'}{selectedTicket.requesterActive===false && <ExStaffBadge />}</span>
                                                {selectedTicket.requesterEmail && <span style={{fontSize:11,color:textM}}>{selectedTicket.requesterEmail}</span>}
                                            </div>},
                                            {label:'Category',    node: <CatBadge label={selectedTicket.categoryLabel||selectedTicket.category} size='lg' />},
                                            {label:'Sub-Category',node: <span style={{fontSize:13,color:selectedTicket.subcategory?(dm?'#c0cfec':'#334155'):(dm?'#4a607f':'#94A3B8'),fontStyle:selectedTicket.subcategory?'normal':'italic'}}>{selectedTicket.subcategory||'Not specified'}</span>},
                                            {label:'Created',     node: <span style={{fontSize:13,color:dm?'#c0cfec':'#334155'}}>{selectedTicket.date}</span>},
                                            {label:'Due Date',    node: raw
                                                ? <span style={{fontSize:13,fontWeight:od?700:400,color:od?'#EF4444':(dm?'#c0cfec':'#334155'),display:'inline-flex',alignItems:'center',gap:5}}>{new Date(raw).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}{od && <><Icon name='alert-triangle' size={12} color='#EF4444' />Overdue</>}</span>
                                                : <span style={{fontSize:13,color:dm?'#4a607f':'#94A3B8'}}>Not set</span>},
                                            {label:'NDIS Related',node: <span style={{fontSize:13,color:dm?'#c0cfec':'#334155'}}>{selectedTicket.ndisRelated?'Yes':'No'}</span>},
                                        ];
                                        return (
                                            <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                                                    {metaItems.map(({label,node})=>(
                                                        <div key={label}>
                                                            <p style={{fontSize:10,fontWeight:700,color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>{label}</p>
                                                            {node}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* ── Description / Issue Details — always shown ── */}
                                    {(()=>{
                                        const issueText = selectedTicket.description||selectedTicket.issueDetails||selectedTicket.issue_details||'';
                                        return (
                                            <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                                <p style={{fontSize:10,fontWeight:700,color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}><Icon name='clipboard-list' size={10} style={{marginRight:4}} />Issue Details / Description</p>
                                                {issueText ? (
                                                    <p style={{fontSize:13,color:dm?'#c0cfec':'#334155',lineHeight:1.7,margin:0,whiteSpace:'pre-wrap',background:dm?'rgba(109,39,115,0.04)':'#F8FAFF',padding:'12px 14px',borderRadius:8,border:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                                        {issueText}
                                                    </p>
                                                ) : (
                                                    <p style={{fontSize:13,color:dm?'#4a607f':'#94A3B8',fontStyle:'italic',margin:0,padding:'12px 14px',background:dm?'rgba(109,39,115,0.03)':'#F8FAFF',borderRadius:8,border:`1px dashed ${dm?'rgba(109,39,115,0.1)':'#E2E8F0'}`}}>No description provided.</p>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* ── Resolution Note (set when marked complete) ── */}
                                    {selectedTicket.resolutionNote && (
                                        <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                            <p style={{fontSize:10,fontWeight:700,color:dm?'#34d399':'#065F46',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}><Icon name='check-circle' size={10} style={{marginRight:4}} color={dm?'#34d399':'#065F46'} />Resolution Note</p>
                                            <p style={{fontSize:13,color:dm?'#6ee7b7':'#065F46',lineHeight:1.7,margin:0,whiteSpace:'pre-wrap',background:dm?'rgba(16,185,129,0.06)':'#ECFDF5',padding:'12px 14px',borderRadius:8,border:`1px solid ${dm?'rgba(16,185,129,0.15)':'#A7F3D0'}`}}>
                                                {selectedTicket.resolutionNote}
                                            </p>
                                        </div>
                                    )}

                                    {/* ── Attachments — always shown, with upload for assignee/admin ── */}
                                    {(()=>{
                                        const atts = selectedTicket.attachments || [];
                                        const canUpload = isAssignee || isBootAdmin || isCreator;
                                        const fileIcon = (type='') => { const n=type.startsWith('image/')?'eye':type.includes('pdf')?'scroll-text':type.includes('sheet')||type.includes('excel')?'bar-chart-2':type.includes('word')||type.includes('doc')?'file-edit':'paperclip'; return <Icon name={n} size={16} color={dm?'#C77DB8':'#6D2773'} />; };
                                        const downloadFile = (att) => {
                                            try {
                                                const bytes = Uint8Array.from(atob(att.content), c=>c.charCodeAt(0));
                                                const blob  = new Blob([bytes], {type: att.type||'application/octet-stream'});
                                                const url   = URL.createObjectURL(blob);
                                                const a     = document.createElement('a');
                                                a.href = url; a.download = att.name; a.click();
                                                setTimeout(()=>URL.revokeObjectURL(url), 2000);
                                            } catch(_) { alert('Could not download attachment'); }
                                        };
                                        const handleAttachUpload = async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (!files.length) return;
                                            setAttUploadLoading(true); setAttUploadError('');
                                            try {
                                                const encoded = await Promise.all(files.map(f => new Promise((resolve, reject) => {
                                                    const reader = new FileReader();
                                                    reader.onload = ev => resolve({ name: f.name, type: f.type, size: f.size, content: ev.target.result.split(',')[1] });
                                                    reader.onerror = reject;
                                                    reader.readAsDataURL(f);
                                                })));
                                                await API.tickets.addAttachments(selectedTicket._dbId, encoded);
                                                await refreshTicket(selectedTicket._dbId);
                                            } catch(err) { setAttUploadError(err.message || 'Upload failed'); }
                                            setAttUploadLoading(false);
                                            e.target.value = '';
                                        };
                                        return (
                                            <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                                                    <p style={{fontSize:10,fontWeight:700,color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:0,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='paperclip' size={11} color={dm?'#4a607f':'#94A3B8'} />Attachments{atts.length > 0 ? ` (${atts.length})` : ''}</p>
                                                    {canUpload && (
                                                        <label style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:dm?'#C77DB8':'#6D2773',border:`1px solid ${dm?'rgba(109,39,115,0.25)':'#E3BFDA'}`,borderRadius:6,fontSize:11,fontWeight:600,cursor:attUploadLoading?'not-allowed':'pointer',opacity:attUploadLoading?0.5:1}}>
                                                            <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.heic" onChange={handleAttachUpload} style={{display:'none'}} disabled={attUploadLoading}/>
                                                            {attUploadLoading ? <><YCLoader size={11} />Uploading…</> : <><Icon name='plus-circle' size={11} color={dm?'#C77DB8':'#6D2773'} />Attach File</>}
                                                        </label>
                                                    )}
                                                </div>
                                                {attUploadError && <p style={{fontSize:11,color:'#DC2626',margin:'0 0 8px'}}>{attUploadError}</p>}
                                                {atts.length === 0 ? (
                                                    <p style={{fontSize:12,color:dm?'#4a607f':'#94A3B8',fontStyle:'italic',margin:0,padding:'10px 14px',background:dm?'rgba(109,39,115,0.03)':'#F8FAFF',borderRadius:8,border:`1px dashed ${dm?'rgba(109,39,115,0.1)':'#E2E8F0'}`}}>No attachments yet.{canUpload ? ' Use the button above to attach files.' : ''}</p>
                                                ) : (
                                                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                        {atts.map((att,i)=>(
                                                            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:dm?'rgba(109,39,115,0.06)':'#F8FAFF',borderRadius:8,border:`1px solid ${dm?'rgba(109,39,115,0.12)':'#E2E8F0'}`}}>
                                                                <span style={{flexShrink:0,display:'flex',alignItems:'center'}}>{fileIcon(att.type)}</span>
                                                                <div style={{flex:1,minWidth:0}}>
                                                                    <div style={{fontSize:12,fontWeight:600,color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{att.name}</div>
                                                                    <div style={{fontSize:11,color:textM}}>{att.size ? `${(att.size/1024).toFixed(0)} KB` : ''}</div>
                                                                </div>
                                                                <button onClick={()=>downloadFile(att)}
                                                                    style={{padding:'5px 12px',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:dm?'#C77DB8':'#6D2773',border:`1px solid ${dm?'rgba(109,39,115,0.25)':'#E3BFDA'}`,borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',flexShrink:0,display:'inline-flex',alignItems:'center',gap:'4px'}}>
                                                                    <Icon name='download' size={11} color={dm?'#C77DB8':'#6D2773'} />Download
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* ── Work Notes / Steps Taken — audit trail ── */}
                                    {(()=>{
                                        const allComments = selectedTicket.comments || [];
                                        const workNotes = allComments.filter(c => c.isInternal);
                                        const fmtAt = ts => { try { return new Date(ts).toLocaleString('en-AU',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch(_){ return ''; } };
                                        const canAddNote = true; // Work notes can be added at any stage for audit trail
                                        const addWorkNote = async () => {
                                            if (!workNote.trim()) return;
                                            setWorkNoteLoading(true);
                                            try {
                                                const u = getSessionUser();
                                                await authFetch(`${HRMS_API}/tickets/${selectedTicket._dbId}/comments`, {
                                                    method: 'POST',
                                                    body: JSON.stringify({ body: workNote.trim(), isInternal: true, actorId: u?.id })
                                                });
                                                setWorkNote('');
                                                await refreshTicket(selectedTicket._dbId);
                                            } catch(_){}
                                            setWorkNoteLoading(false);
                                        };
                                        return (
                                            <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                                <p style={{fontSize:10,fontWeight:700,color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px',display:'flex',alignItems:'center',gap:'5px'}}><Icon name='wrench' size={11} color={dm?'#4a607f':'#94A3B8'} />Resolution Details / Steps Taken</p>
                                                {workNotes.length === 0 ? (
                                                    <p style={{fontSize:12,color:dm?'#4a607f':'#94A3B8',fontStyle:'italic',margin:'0 0 10px',padding:'10px 14px',background:dm?'rgba(109,39,115,0.03)':'#F8FAFF',borderRadius:8,border:`1px dashed ${dm?'rgba(109,39,115,0.1)':'#E2E8F0'}`}}>No work notes yet. Use the field below to document steps taken during resolution.</p>
                                                ) : (
                                                    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
                                                        {workNotes.map((c,i)=>(
                                                            <div key={c.id||i} style={{padding:'10px 12px',background:dm?'rgba(245,158,11,0.06)':'#FFFBEB',borderRadius:8,border:`1px solid ${dm?'rgba(245,158,11,0.15)':'#FDE68A'}`}}>
                                                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                                                                    <span style={{fontSize:11,fontWeight:700,color:dm?'#fcd34d':'#92400E'}}>{c.authorName || `Staff #${c.userId}`}</span>
                                                                    <span style={{fontSize:10,color:dm?'#6b80a4':'#94A3B8'}}>{fmtAt(c.at)}</span>
                                                                </div>
                                                                <p style={{fontSize:13,color:dm?'#fef3c7':'#78350F',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{c.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {canAddNote && (
                                                    <div>
                                                        <textarea rows="3" value={workNote} onChange={e=>setWorkNote(e.target.value)}
                                                            placeholder="Document a step taken, update, or note about the resolution process…"
                                                            style={{width:'100%',border:`1px solid ${dm?'rgba(245,158,11,0.25)':'#FDE68A'}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'vertical',boxSizing:'border-box',background:dm?'rgba(8,16,36,0.5)':'#FFFBEB',color:textP,outline:'none',marginBottom:8,fontFamily:'inherit',lineHeight:1.5}}/>
                                                        <button disabled={workNoteLoading||!workNote.trim()} onClick={addWorkNote}
                                                            style={{padding:'8px 16px',background:(workNoteLoading||!workNote.trim())?'#94A3B8':'#D97706',color:'white',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:(workNoteLoading||!workNote.trim())?'not-allowed':'pointer',opacity:workNoteLoading?0.5:1,display:'inline-flex',alignItems:'center',gap:'5px'}}>
                                                            {workNoteLoading?<><YCLoader size={13} />Saving…</>:<><Icon name='file-edit' size={13} color='#fff' />Add Work Note</>}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* ── Assignee Actions ── */}
                                    {isAssignee && !['Resolved','Closed'].includes(selectedTicket.status) && (()=>{
                                        // Derive rejection context from approvers state
                                        const displayApproversForAssignee = approvers.length > 0 ? approvers : (selectedTicket.approvers || []);
                                        const rejectedApprovers = displayApproversForAssignee.filter(ap => (ap.status||'').toLowerCase() === 'rejected');
                                        const wasReopened = rejectedApprovers.length > 0 && selectedTicket.status !== 'Pending Approval';
                                        return (
                                        <div style={{marginBottom:20,padding:16,background:dm?'rgba(109,39,115,0.08)':'#F6ECF4',borderRadius:12,border:`1px solid ${dm?'rgba(109,39,115,0.2)':'#E3BFDA'}`}}>
                                            <p style={{fontSize:12,fontWeight:700,color:dm?'#C77DB8':'#5D2162',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>
                                                <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}>{selectedTicket.status === 'Pending Approval' ? <><Icon name='hourglass' size={12} color={dm?'#C77DB8':'#5D2162'} />Your Actions (Assignee)</> : wasReopened ? <><Icon name='refresh-cw' size={12} color={dm?'#C77DB8':'#5D2162'} />Your Actions (Assignee)</> : <><Icon name='pencil' size={12} color={dm?'#C77DB8':'#5D2162'} />Your Actions (Assignee)</>}</span>
                                            </p>
                                            {actionError && <div style={{fontSize:12,color:'#DC2626',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'8px 12px',marginBottom:10}}>{actionError}</div>}

                                            {/* ── PENDING APPROVAL STATE: show waiting banner ── */}
                                            {selectedTicket.status === 'Pending Approval' && (
                                                <div>
                                                    <div style={{padding:14,background:dm?'rgba(16,185,129,0.07)':'#ECFDF5',borderRadius:10,border:`1px solid ${dm?'rgba(16,185,129,0.2)':'#A7F3D0'}`,marginBottom:12}}>
                                                        <p style={{fontSize:13,fontWeight:700,color:dm?'#34d399':'#065F46',margin:'0 0 4px',display:'flex',alignItems:'center',gap:'5px'}}><Icon name='check-circle' size={14} color={dm?'#34d399':'#065F46'} />Resolution submitted — awaiting approval</p>
                                                        <p style={{fontSize:12,color:dm?'#6ee7b7':'#047857',margin:0}}>Your resolution has been sent to the approver(s) below. You will be notified when they respond.</p>
                                                    </div>
                                                    {selectedTicket.resolutionNote && (
                                                        <div style={{padding:'10px 12px',background:dm?'rgba(109,39,115,0.05)':'#F8FAFF',borderRadius:8,border:`1px solid ${dm?'rgba(109,39,115,0.12)':'#EAD6E6'}`}}>
                                                            <p style={{fontSize:10,fontWeight:700,color:dm?'#C77DB8':'#5D2162',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>Your Resolution</p>
                                                            <p style={{fontSize:13,color:dm?'#c0cfec':'#334155',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{selectedTicket.resolutionNote}</p>
                                                        </div>
                                                    )}
                                                    <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
                                                        {displayApproversForAssignee.map(ap => {
                                                            const s=(ap.status||'pending').toLowerCase();
                                                            const stBg={approved:dm?'rgba(16,185,129,0.1)':'#ECFDF5',rejected:dm?'rgba(239,68,68,0.1)':'#FEF2F2',pending:dm?'rgba(239,68,68,0.1)':'#FEF2F2'};
                                                            const stC={approved:dm?'#34d399':'#065F46',rejected:dm?'#fca5a5':'#991B1B',pending:dm?'#fca5a5':'#991B1B'};
                                                            const stI={approved:'check-circle',rejected:'x-circle',pending:'hourglass'};
                                                            return (
                                                                <div key={ap.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:stBg[s]||stBg.pending,borderRadius:8}}>
                                                                    <div style={{width:28,height:28,borderRadius:'50%',background:dm?'rgba(255,255,255,0.1)':'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,color:stC[s]||stC.pending,flexShrink:0}}>
                                                                        {(ap.userName||ap.name||'?').charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div style={{flex:1,minWidth:0}}>
                                                                        <p style={{fontSize:12,fontWeight:600,color:stC[s]||stC.pending,margin:0,display:'inline-flex',alignItems:'center',gap:'4px'}}>{ap.userName||ap.name} <Icon name={stI[s]||'hourglass'} size={12} color={stC[s]||stC.pending} />{s.charAt(0).toUpperCase()+s.slice(1)}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── REOPENED: rejection callout before re-submit form ── */}
                                            {selectedTicket.status !== 'Pending Approval' && wasReopened && (
                                                <div style={{padding:14,background:dm?'rgba(239,68,68,0.08)':'#FEF2F2',borderRadius:10,border:`1px solid ${dm?'rgba(239,68,68,0.25)':'#FECACA'}`,marginBottom:14}}>
                                                    <p style={{fontSize:13,fontWeight:700,color:dm?'#fca5a5':'#991B1B',margin:'0 0 8px',display:'flex',alignItems:'center',gap:'5px'}}><Icon name='refresh-cw' size={13} color={dm?'#fca5a5':'#991B1B'} />This ticket was reopened — revision required</p>
                                                    {rejectedApprovers.map(ap => (
                                                        <div key={ap.id} style={{marginBottom:6}}>
                                                            <p style={{fontSize:12,fontWeight:600,color:dm?'#fca5a5':'#DC2626',margin:'0 0 2px'}}>{ap.userName||ap.name} said:</p>
                                                            <p style={{fontSize:12,color:dm?'#fecaca':'#7F1D1D',margin:0,lineHeight:1.5,fontStyle:'italic',background:dm?'rgba(239,68,68,0.06)':'#FFF5F5',padding:'6px 10px',borderRadius:6}}>"{ap.justification||'No reason provided.'}"</p>
                                                        </div>
                                                    ))}
                                                    <p style={{fontSize:11,color:dm?'#8fa4cc':'#64748B',marginTop:8,marginBottom:0}}>Please address the feedback above, then submit a revised resolution below.</p>
                                                </div>
                                            )}

                                            {/* ── ACTIVE STATE: Mark Complete form ── */}
                                            {selectedTicket.status !== 'Pending Approval' && (
                                                <div style={{marginBottom:12}}>
                                                    {!wasReopened && <p style={{fontSize:11,color:dm?'#8fa4cc':'#5D2162',marginBottom:10}}>Once your work is done, describe the resolution and submit for approver review.</p>}

                                                    <label style={{display:'block',fontSize:11,fontWeight:700,color:dm?'#c0cfec':'#334155',marginBottom:5}}>
                                                        {wasReopened ? 'Revised Resolution' : 'Resolution Note'} <span style={{color:'#EF4444'}}>*</span>
                                                        <span style={{fontWeight:400,color:textM,marginLeft:4}}>(required for audit trail)</span>
                                                    </label>
                                                    <textarea rows="4" value={resolutionNote} onChange={e=>setResolutionNote(e.target.value)}
                                                        placeholder={wasReopened ? 'Describe what you changed or improved to address the feedback…' : 'Describe what was done to resolve this ticket…'}
                                                        style={{width:'100%',border:`1px solid ${wasReopened?(dm?'rgba(239,68,68,0.3)':'#FECACA'):(dm?'rgba(109,39,115,0.25)':'#E3BFDA')}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'vertical',boxSizing:'border-box',background:dm?'rgba(8,16,36,0.5)':'white',color:textP,outline:'none',marginBottom:10,fontFamily:'inherit',lineHeight:1.5}}/>

                                                    <button disabled={actionLoading||hasPendingExt||!resolutionNote.trim()} onClick={async()=>{
                                                        setActionLoading(true); setActionError('');
                                                        try { await API.tickets.complete(selectedTicket._dbId, resolutionNote.trim()); setResolutionNote(''); await refreshTicket(selectedTicket._dbId); }
                                                        catch(e){ setActionError(e.message); }
                                                        finally{ setActionLoading(false); }
                                                    }} style={{width:'100%',padding:'11px 20px',background:(hasPendingExt||!resolutionNote.trim())?'#94A3B8':wasReopened?'#DC2626':'#6D2773',color:'white',border:'none',borderRadius:9,fontSize:13,fontWeight:700,cursor:(hasPendingExt||!resolutionNote.trim())?'not-allowed':'pointer',opacity:actionLoading?0.5:1}}>
                                                        {actionLoading?<><YCLoader size={13} />Submitting…</>:wasReopened?<><Icon name='refresh-cw' size={13} color='#fff' />Resubmit Revised Resolution</>:<><Icon name='check-circle' size={13} color='#fff' />Mark as Complete & Submit for Approval</>}
                                                    </button>
                                                    {hasPendingExt && <p style={{fontSize:11,color:'#D97706',marginTop:6,display:'flex',alignItems:'center',gap:'4px'}}><Icon name='hourglass' size={11} color='#D97706' />Cannot submit for approval while an extension request is pending.</p>}
                                                    {!resolutionNote.trim() && !hasPendingExt && <p style={{fontSize:11,color:dm?'#6b80a4':'#94A3B8',marginTop:6}}>Enter a resolution note above to enable submission.</p>}
                                                </div>
                                            )}

                                            {/* Request Extension */}
                                            {selectedTicket.status !== 'Pending Approval' && !hasPendingExt && (
                                                <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${dm?'rgba(109,39,115,0.15)':'#E3BFDA'}`}}>
                                                    {!extMode ? (
                                                        <button onClick={()=>{setExtMode(true);setActionError('');}}
                                                            style={{padding:'8px 16px',background:'none',border:`1px solid ${dm?'rgba(109,39,115,0.3)':'#E3BFDA'}`,color:dm?'#C77DB8':'#5D2162',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'5px'}}>
                                                            <Icon name='calendar' size={12} color={dm?'#C77DB8':'#5D2162'} />Request Time Extension
                                                        </button>
                                                    ) : (
                                                        <div>
                                                            <p style={{fontSize:12,fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:8}}>Request new due date</p>
                                                            <div style={{marginBottom:10}}>
                                                                <label style={{display:'block',fontSize:11,fontWeight:600,color:textM,marginBottom:4}}>Proposed New Due Date <span style={{color:'#EF4444'}}>*</span></label>
                                                                <input type="date" value={extDate} onChange={e=>setExtDate(e.target.value)} min={new Date().toISOString().slice(0,10)}
                                                                    style={{width:'100%',border:`1px solid ${borderC}`,borderRadius:8,padding:'8px 10px',fontSize:13,boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,outline:'none'}}/>
                                                            </div>
                                                            <div style={{marginBottom:10}}>
                                                                <label style={{display:'block',fontSize:11,fontWeight:600,color:textM,marginBottom:4}}>Reason</label>
                                                                <textarea rows="2" value={extNote} onChange={e=>setExtNote(e.target.value)} placeholder="Why do you need more time?"
                                                                    style={{width:'100%',border:`1px solid ${borderC}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'none',boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,outline:'none'}}/>
                                                            </div>
                                                            <div style={{display:'flex',gap:8}}>
                                                                <button disabled={actionLoading||!extDate} onClick={async()=>{
                                                                    setActionLoading(true); setActionError('');
                                                                    try { await API.tickets.requestExtension(selectedTicket._dbId,extDate,extNote); setExtMode(false); setExtDate(''); setExtNote(''); await refreshTicket(selectedTicket._dbId); }
                                                                    catch(e){ setActionError(e.message); }
                                                                    finally{ setActionLoading(false); }
                                                                }} style={{flex:1,padding:'9px',background:'#D97706',color:'white',border:'none',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',opacity:(actionLoading||!extDate)?0.5:1}}>
                                                                    {actionLoading?<><YCLoader size={13} />…</>:<><Icon name='calendar' size={13} color='#fff' />Submit Extension Request</>}
                                                                </button>
                                                                <button onClick={()=>{setExtMode(false);setExtDate('');setExtNote('');setActionError('');}}
                                                                    style={{padding:'9px 14px',background:dm?'rgba(6,9,22,0.7)':'#F5F7FF',color:dm?'#c0cfec':'#334155',border:'none',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Show pending extension status to assignee */}
                                            {hasPendingExt && (
                                                <div style={{marginTop:12,padding:12,background:dm?'rgba(245,158,11,0.08)':'#FFFBEB',borderRadius:10,border:`1px solid ${dm?'rgba(245,158,11,0.2)':'#FDE68A'}`}}>
                                                    <p style={{fontSize:12,fontWeight:600,color:'#92400E',margin:'0 0 4px',display:'flex',alignItems:'center',gap:'5px'}}><Icon name='hourglass' size={12} color='#92400E' />Extension Request Pending</p>
                                                    <p style={{fontSize:11,color:dm?'#fcd34d':'#D97706',margin:0}}>Proposed: <strong>{selectedTicket.extensionRequestedDue ? new Date(selectedTicket.extensionRequestedDue).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}</strong></p>
                                                    {selectedTicket.extensionRequestNote && <p style={{fontSize:11,color:dm?'#8fa4cc':'#64748B',margin:'4px 0 0'}}>Note: {selectedTicket.extensionRequestNote}</p>}
                                                    <p style={{fontSize:11,color:dm?'#4a607f':'#94A3B8',margin:'4px 0 0'}}>Waiting for an approver to respond.</p>
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })()}

                                    {/* ── Approver: Extension Response Panel ── */}
                                    {isAnyApprover && hasPendingExt && (
                                        <div style={{marginBottom:20,padding:16,background:dm?'rgba(245,158,11,0.08)':'#FFFBEB',borderRadius:12,border:`1px solid ${dm?'rgba(245,158,11,0.25)':'#FDE68A'}`}}>
                                            <p style={{fontSize:12,fontWeight:700,color:'#92400E',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='calendar' size={12} color='#92400E' />Extension Request — Your Decision</p>
                                            <p style={{fontSize:13,color:dm?'#c0cfec':'#374151',marginBottom:4}}>
                                                The assignee <strong>{selectedTicket.assigned||'Assignee'}</strong> is requesting a time extension.
                                            </p>
                                            <p style={{fontSize:13,marginBottom:4,color:dm?'#c0cfec':'#374151'}}>
                                                Proposed new date: <strong>{selectedTicket.extensionRequestedDue ? new Date(selectedTicket.extensionRequestedDue).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}</strong>
                                            </p>
                                            {selectedTicket.extensionRequestNote && <p style={{fontSize:12,color:dm?'#8fa4cc':'#64748B',marginBottom:12}}>Reason: "{selectedTicket.extensionRequestNote}"</p>}
                                            <div style={{marginBottom:10}}>
                                                <label style={{display:'block',fontSize:11,fontWeight:600,color:textM,marginBottom:4}}>Optional note to assignee</label>
                                                <textarea rows="2" value={extResNote} onChange={e=>setExtResNote(e.target.value)} placeholder="Comment (optional)…"
                                                    style={{width:'100%',border:`1px solid ${borderC}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'none',boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,outline:'none'}}/>
                                            </div>
                                            {actionError && <div style={{fontSize:12,color:'#DC2626',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'8px 12px',marginBottom:10}}>{actionError}</div>}
                                            <div style={{display:'flex',gap:10}}>
                                                <button disabled={actionLoading} onClick={async()=>{
                                                    setActionLoading(true); setActionError('');
                                                    try { await API.tickets.respondExtension(selectedTicket._dbId,'approve',extResNote); setExtResNote(''); await refreshTicket(selectedTicket._dbId); }
                                                    catch(e){ setActionError(e.message); }
                                                    finally{ setActionLoading(false); }
                                                }} style={{flex:1,padding:'10px',background:'#059669',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:actionLoading?0.5:1}}>
                                                    {actionLoading?<><YCLoader size={13} />…</>:<><Icon name='check-circle' size={13} color='#fff' />Approve Extension</>}
                                                </button>
                                                <button disabled={actionLoading} onClick={async()=>{
                                                    setActionLoading(true); setActionError('');
                                                    try { await API.tickets.respondExtension(selectedTicket._dbId,'deny',extResNote); setExtResNote(''); await refreshTicket(selectedTicket._dbId); }
                                                    catch(e){ setActionError(e.message); }
                                                    finally{ setActionLoading(false); }
                                                }} style={{flex:1,padding:'10px',background:'#DC2626',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:actionLoading?0.5:1}}>
                                                    {actionLoading?<><YCLoader size={13} />…</>:<><Icon name='x-circle' size={13} color='#fff' />Deny Extension</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Approvers panel */}
                                    {(()=>{
                                        const displayApprovers = approvers.length > 0 ? approvers : (selectedTicket.approvers || []);
                                        // staffList from outer scope; filter out assignee
                                        const availableForApproval = staffList.filter(u => u.id !== selectedTicket.assigneeId);
                                        return (
                                        <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                                                <p style={{fontSize:10,fontWeight:700,color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:0,display:'flex',alignItems:'center',gap:'5px'}}>
                                                    <Icon name='user-check' size={11} color={dm?'#4a607f':'#94A3B8'} />Approvers{displayApprovers.length > 0 ? ` (${displayApprovers.length})` : ''}
                                                </p>
                                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                                    {selectedTicket.status === 'Pending Approval' && (
                                                        <span style={{fontSize:11,fontWeight:600,color:'#D97706',background:'#FFFBEB',padding:'2px 8px',borderRadius:20,border:'1px solid #FDE68A'}}>Awaiting approval</span>
                                                    )}
                                                </div>
                                            </div>

                                            {displayApprovers.length === 0 ? (
                                                <p style={{fontSize:12,color:dm?'#4a607f':'#94A3B8',fontStyle:'italic',margin:0,padding:'10px 14px',background:dm?'rgba(109,39,115,0.03)':'#F8FAFF',borderRadius:8,border:`1px dashed ${dm?'rgba(109,39,115,0.1)':'#E2E8F0'}`}}>
                                                    No approvers assigned to this ticket.
                                                </p>
                                            ) : (
                                                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                                                    {displayApprovers.map(ap => {
                                                        const s=(ap.status||'pending').toLowerCase();
                                                        const stBg={approved:dm?'rgba(16,185,129,0.08)':'#ECFDF5',rejected:dm?'rgba(239,68,68,0.08)':'#FEF2F2',pending:dm?'rgba(245,158,11,0.1)':'#FFFBEB'};
                                                        const stBorder={approved:dm?'rgba(16,185,129,0.2)':'#A7F3D0',rejected:dm?'rgba(239,68,68,0.2)':'#FECACA',pending:dm?'rgba(245,158,11,0.3)':'#FDE68A'};
                                                        const stC={approved:dm?'#34d399':'#065F46',rejected:dm?'#fca5a5':'#991B1B',pending:dm?'#fcd34d':'#92400E'};
                                                        const stAvatar={approved:dm?'rgba(16,185,129,0.2)':'#D1FAE5',rejected:dm?'rgba(239,68,68,0.2)':'#FEE2E2',pending:dm?'rgba(245,158,11,0.2)':'#FEF3C7'};
                                                        const stI={approved:'check-circle',rejected:'x-circle',pending:'hourglass'};
                                                        const stBadgeBg={approved:dm?'rgba(16,185,129,0.15)':'#D1FAE5',rejected:dm?'rgba(239,68,68,0.15)':'#FEE2E2',pending:dm?'rgba(245,158,11,0.15)':'#FEF3C7'};
                                                        return (
                                                            <div key={ap.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:stBg[s]||stBg.pending,border:`1px solid ${stBorder[s]||stBorder.pending}`}}>
                                                                <div style={{width:34,height:34,borderRadius:'50%',background:stAvatar[s]||stAvatar.pending,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:stC[s]||stC.pending,flexShrink:0,letterSpacing:'-0.5px'}}>
                                                                    {(ap.userName||ap.name||'?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div style={{flex:1,minWidth:0}}>
                                                                    <p style={{fontSize:13,fontWeight:700,color:dm?'#c0cfec':'#1E293B',margin:0}}>{ap.userName||ap.name}</p>
                                                                    {ap.justification && <p style={{fontSize:11,color:stC[s]||stC.pending,margin:'2px 0 0',display:'flex',alignItems:'center',gap:'3px'}}><Icon name={s==='approved'?'file-edit':'message-square'} size={10} color={stC[s]||stC.pending} />{ap.justification}</p>}
                                                                </div>
                                                                <span style={{fontSize:11,fontWeight:700,color:stC[s]||stC.pending,flexShrink:0,display:'inline-flex',alignItems:'center',gap:'4px',background:stBadgeBg[s]||stBadgeBg.pending,padding:'3px 9px',borderRadius:20,border:`1px solid ${stBorder[s]||stBorder.pending}`}}><Icon name={stI[s]||'hourglass'} size={11} color={stC[s]||stC.pending} />{s.charAt(0).toUpperCase()+s.slice(1)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })()}

                                    {/* Escalation trail */}
                                    {(escalations.length > 0 || selectedTicket.isEscalated) && (
                                        <div className="mb-5 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                            <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-3" style={{display:'flex',alignItems:'center',gap:'5px'}}><Icon name='arrow-up-circle' size={11} color='#C2410C' />Escalation Trail</p>
                                            <div className="space-y-2">
                                                {escalations.map((e, i) => (
                                                    <div key={e.id || i} className="text-xs text-orange-800">
                                                        <span className="font-semibold">{e.escalated_by_name}</span> escalated to <span className="font-semibold">{e.escalated_to_name}</span>
                                                        <span className="text-orange-500 ml-1">— {e.reason}</span>
                                                        <span className="text-orange-400 ml-2">{e.created_at ? new Date(e.created_at).toLocaleDateString() : ''}</span>
                                                    </div>
                                                ))}
                                                {escalations.length === 0 && selectedTicket.isEscalated && (
                                                    <p className="text-xs text-orange-600 italic">This ticket has been escalated.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Escalation action panel — managers/admins */}
                                    {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                                        <div className="mb-5">
                                            {!escalateMode ? (
                                                <button
                                                    onClick={() => { setEscalateMode(true); setActionError(''); }}
                                                    style={{width:'100%',padding:'11px 16px',background:'#C2410C',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'7px',letterSpacing:'0.01em'}}
                                                >
                                                    <Icon name='arrow-up-circle' size={15} color='#fff' />Escalate This Ticket
                                                </button>
                                            ) : (
                                                <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
                                                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-3">Escalate Ticket</p>

                                                    {actionError && (
                                                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{actionError}</div>
                                                    )}

                                                    <div className="mb-3">
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Escalate To <span className="text-red-400">*</span></label>
                                                        <select
                                                            value={escalateTo}
                                                            onChange={e => setEscalateTo(e.target.value)}
                                                            className="w-full border border-orange-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                        >
                                                            <option value="">— Select person —</option>
                                                            {staffList.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name}{s.department_name ? ` (${s.department_name})` : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason <span className="text-red-400">*</span></label>
                                                        <textarea
                                                            rows="3"
                                                            value={escalateReason}
                                                            onChange={e => setEscalateReason(e.target.value)}
                                                            placeholder="Why is this ticket being escalated?"
                                                            className="w-full border border-orange-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                                        />
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            disabled={actionLoading || !escalateTo || !escalateReason.trim()}
                                                            onClick={async () => {
                                                                setActionLoading(true); setActionError('');
                                                                try {
                                                                    const data = await API.tickets.escalate(
                                                                        selectedTicket._dbId,
                                                                        Number(escalateTo),
                                                                        escalateReason
                                                                    );
                                                                    if (data.ticket?.escalations) setEscalations(data.ticket.escalations);
                                                                    setEscalateMode(false); setEscalateTo(''); setEscalateReason('');
                                                                    await refreshTicket(selectedTicket._dbId);
                                                                    const escData = await API.tickets.getEscalations(selectedTicket._dbId).catch(() => ({ escalations: [] }));
                                                                    if (escData.escalations) setEscalations(escData.escalations);
                                                                } catch(e) { setActionError(e.message); }
                                                                finally { setActionLoading(false); }
                                                            }}
                                                            className="flex-1 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                                                        >
                                                            {actionLoading ? <><YCLoader size={13} />…</> : <><Icon name='arrow-up-circle' size={13} color='#fff' />Confirm Escalation</>}
                                                        </button>
                                                        <button
                                                            onClick={() => { setEscalateMode(false); setEscalateTo(''); setEscalateReason(''); setActionError(''); }}
                                                            className="px-4 py-2.5 bg-white border border-orange-200 text-orange-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedTicket.status === 'Pending Approval' && isApprover && (
                                        <div style={{marginTop:16,padding:16,background:dm?'rgba(249,115,22,0.10)':'#FFF7ED',borderRadius:12,border:`1px solid ${dm?'rgba(249,115,22,0.25)':'#FED7AA'}`}}>
                                            <p style={{fontSize:12,fontWeight:700,color:'#C2410C',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='check-circle' size={12} color='#C2410C' />Your Decision (Approver)</p>
                                            <p style={{fontSize:11,color:dm?'#fcd34d':'#92400E',marginBottom:12}}>Approve to close the ticket, or Reopen to send it back to the assignee for more work.</p>
                                            {actionError && <div style={{fontSize:12,color:'#DC2626',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'8px 12px',marginBottom:10}}>{actionError}</div>}
                                            {!rejectMode ? (
                                                <div>
                                                    <div style={{marginBottom:10}}>
                                                        <label style={{display:'block',fontSize:11,fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:4}}>Acceptance Note <span style={{fontSize:10,fontWeight:400,color:dm?'#4a607f':'#94A3B8'}}>(optional)</span></label>
                                                        <textarea rows="2" value={acceptanceNote} onChange={e=>setAcceptanceNote(e.target.value)}
                                                            placeholder="Add a note about your approval decision…"
                                                            style={{width:'100%',border:`1px solid ${dm?'rgba(16,185,129,0.3)':'#A7F3D0'}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'none',outline:'none',boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,fontFamily:'inherit',marginBottom:0}}/>
                                                    </div>
                                                    <div style={{display:'flex',gap:'10px'}}>
                                                    <button disabled={actionLoading} onClick={async()=>{
                                                        setActionLoading(true); setActionError('');
                                                        try {
                                                            const data = await API.tickets.approve(selectedTicket._dbId, acceptanceNote);
                                                            if(data.ticket?.approvers) setApprovers(data.ticket.approvers);
                                                            setAcceptanceNote('');
                                                            await refreshTicket(selectedTicket._dbId);
                                                        } catch(e){ setActionError(e.message); }
                                                        finally{ setActionLoading(false); }
                                                    }} style={{flex:1,padding:'10px',background:'#059669',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:actionLoading?0.5:1}}>
                                                        {actionLoading?<><YCLoader size={13} />…</>:<><Icon name='check-circle' size={13} color='#fff' />Approve</>}
                                                    </button>
                                                    <button disabled={actionLoading} onClick={()=>{setRejectMode(true);setActionError('');}}
                                                        style={{flex:1,padding:'10px',background:'#DC2626',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:actionLoading?0.5:1,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
                                                        <Icon name='refresh-cw' size={13} color='#fff' />Reopen Ticket
                                                    </button>
                                                </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p style={{fontSize:12,color:dm?'#c0cfec':'#374151',marginBottom:6}}>Provide a reason so the assignee knows what needs to be fixed:</p>
                                                    <label style={{display:'block',fontSize:11,fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:6}}>Reason for Reopening <span style={{color:'#EF4444'}}>*</span></label>
                                                    <textarea rows="3" value={justification} onChange={e=>setJustification(e.target.value)}
                                                        placeholder="What needs to be fixed or improved before this ticket can be approved?"
                                                        style={{width:'100%',border:`1px solid ${dm?'rgba(239,68,68,0.3)':'#FECACA'}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'none',outline:'none',marginBottom:10,boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,fontFamily:'inherit'}}/>
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        <button disabled={actionLoading||!justification.trim()} onClick={async()=>{
                                                            setActionLoading(true); setActionError('');
                                                            try {
                                                                const data = await API.tickets.reject(selectedTicket._dbId,justification);
                                                                if(data.ticket?.approvers) setApprovers(data.ticket.approvers);
                                                                setRejectMode(false); setJustification('');
                                                                await refreshTicket(selectedTicket._dbId);
                                                            } catch(e){ setActionError(e.message); }
                                                            finally{ setActionLoading(false); }
                                                        }} style={{flex:1,padding:'9px',background:'#DC2626',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:(actionLoading||!justification.trim())?0.5:1}}>
                                                            {actionLoading?<><YCLoader size={13} />…</>:<><Icon name='refresh-cw' size={13} color='#fff' />Confirm Reopen</>}
                                                        </button>
                                                        <button onClick={()=>{setRejectMode(false);setJustification('');setActionError('');}}
                                                            style={{padding:'9px 16px',background:dm?'rgba(6,9,22,0.7)':'#F5F7FF',color:dm?'#c0cfec':'#334155',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* ── Close Ticket panel — requester confirms resolution → Closed ── */}
                                    {selectedTicket.status === 'Resolved' && (isCreator || isBootAdmin) && (
                                        <div style={{marginTop:16,padding:16,background:dm?'rgba(16,185,129,0.10)':'#ECFDF5',borderRadius:12,border:`1px solid ${dm?'rgba(16,185,129,0.25)':'#6EE7B7'}`}}>
                                            <p style={{fontSize:12,fontWeight:700,color:dm?'#34d399':'#065F46',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='check-circle' size={12} color={dm?'#34d399':'#065F46'} />Confirm & Close Ticket</p>
                                            <p style={{fontSize:11,color:dm?'#6ee7b7':'#047857',marginBottom:12}}>
                                                Are you satisfied with the resolution? Closing the ticket finalises it permanently.
                                            </p>
                                            {actionError && <div style={{fontSize:12,color:'#DC2626',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'8px 12px',marginBottom:10}}>{actionError}</div>}
                                            <button
                                                disabled={actionLoading}
                                                onClick={async()=>{
                                                    if (!window.confirm('Close this ticket? This action is permanent.')) return;
                                                    setActionLoading(true); setActionError('');
                                                    try {
                                                        await API.tickets.close(selectedTicket._dbId);
                                                        await refreshTicket(selectedTicket._dbId);
                                                    } catch(e){ setActionError(e.message); }
                                                    finally{ setActionLoading(false); }
                                                }}
                                                style={{width:'100%',padding:'10px',background:actionLoading?'#6EE7B7':'#059669',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:actionLoading?'not-allowed':'pointer',opacity:actionLoading?0.6:1}}>
                                                {actionLoading ? <><YCLoader size={13} />Closing…</> : <><Icon name='lock' size={13} color='#fff' />Close Ticket</>}
                                            </button>
                                        </div>
                                    )}

                                    {/* ── Reopen panel — any approver can reopen a resolved/closed ticket ── */}
                                    {['Resolved','Closed'].includes(selectedTicket.status) && isAnyApprover && (
                                        <div style={{marginTop:16,padding:16,background:dm?'rgba(59,130,246,0.10)':'#EFF6FF',borderRadius:12,border:`1px solid ${dm?'rgba(59,130,246,0.25)':'#BFDBFE'}`}}>
                                            <p style={{fontSize:12,fontWeight:700,color:dm?'#93c5fd':'#1E40AF',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='refresh-cw' size={12} color={dm?'#93c5fd':'#1E40AF'} />Reopen Ticket</p>
                                            <p style={{fontSize:11,color:dm?'#93c5fd':'#1D4ED8',marginBottom:12}}>As an approver, you can reopen this ticket if further work is needed. This will reset all approver decisions and send the ticket back to the assignee.</p>
                                            {actionError && <div style={{fontSize:12,color:'#DC2626',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'8px 12px',marginBottom:10}}>{actionError}</div>}
                                            {!reopenMode ? (
                                                <button onClick={()=>{setReopenMode(true);setReopenJustification('');setActionError('');}}
                                                    style={{width:'100%',padding:'10px',background:'#1D4ED8',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                                                    <Icon name='refresh-cw' size={13} color='#fff' />Reopen This Ticket
                                                </button>
                                            ) : (
                                                <div>
                                                    <p style={{fontSize:12,color:dm?'#c0cfec':'#374151',marginBottom:6}}>Provide a reason so the assignee knows what needs to be addressed:</p>
                                                    <label style={{display:'block',fontSize:11,fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:6}}>Reason for Reopening <span style={{color:'#EF4444'}}>*</span></label>
                                                    <textarea rows="3" value={reopenJustification} onChange={e=>setReopenJustification(e.target.value)}
                                                        placeholder="What needs to be fixed or revisited before this ticket can be closed?"
                                                        style={{width:'100%',border:`1px solid ${dm?'rgba(59,130,246,0.3)':'#BFDBFE'}`,borderRadius:8,padding:'8px 10px',fontSize:13,resize:'none',outline:'none',marginBottom:10,boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,fontFamily:'inherit'}}/>
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        <button disabled={actionLoading||!reopenJustification.trim()} onClick={async()=>{
                                                            setActionLoading(true); setActionError('');
                                                            try {
                                                                const data = await API.tickets.reopen(selectedTicket._dbId, reopenJustification.trim());
                                                                if(data.ticket?.approvers) setApprovers(data.ticket.approvers);
                                                                setReopenMode(false); setReopenJustification('');
                                                                await refreshTicket(selectedTicket._dbId);
                                                            } catch(e){ setActionError(e.message); }
                                                            finally{ setActionLoading(false); }
                                                        }} style={{flex:1,padding:'9px',background:'#1D4ED8',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:(actionLoading||!reopenJustification.trim())?0.5:1}}>
                                                            {actionLoading?<><YCLoader size={13} />…</>:<><Icon name='refresh-cw' size={13} color='#fff' />Confirm Reopen</>}
                                                        </button>
                                                        <button onClick={()=>{setReopenMode(false);setReopenJustification('');setActionError('');}}
                                                            style={{padding:'9px 16px',background:dm?'rgba(6,9,22,0.7)':'#F5F7FF',color:dm?'#c0cfec':'#334155',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Approval History (immutable audit trail) ── */}
                                    {Array.isArray(selectedTicket.approvalHistory) && selectedTicket.approvalHistory.length > 0 && (
                                        <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                            <p style={{fontSize:10,fontWeight:700,color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px',display:'flex',alignItems:'center',gap:'5px'}}><Icon name='clipboard-list' size={11} color={dm?'#4a607f':'#94A3B8'} />Approval History</p>
                                            <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                {selectedTicket.approvalHistory.map((h,i) => {
                                                    const isApproved = (h.action||'').toLowerCase() === 'approved';
                                                    const isRejected = (h.action||'').toLowerCase() === 'rejected';
                                                    const isReopened = (h.action||'').toLowerCase() === 'reopened';
                                                    const bg = isApproved ? (dm?'rgba(16,185,129,0.07)':'#ECFDF5') : isRejected ? (dm?'rgba(239,68,68,0.07)':'#FEF2F2') : isReopened ? (dm?'rgba(59,130,246,0.07)':'#EFF6FF') : (dm?'rgba(109,39,115,0.05)':'#F8FAFF');
                                                    const border = isApproved ? (dm?'rgba(16,185,129,0.18)':'#A7F3D0') : isRejected ? (dm?'rgba(239,68,68,0.18)':'#FECACA') : isReopened ? (dm?'rgba(59,130,246,0.2)':'#BFDBFE') : (dm?'rgba(109,39,115,0.12)':'#EAD6E6');
                                                    const col = isApproved ? (dm?'#34d399':'#065F46') : isRejected ? (dm?'#fca5a5':'#991B1B') : isReopened ? (dm?'#93c5fd':'#1E40AF') : (dm?'#C77DB8':'#5D2162');
                                                    const icon = isApproved ? 'check-circle' : isRejected ? 'x-circle' : isReopened ? 'refresh-cw' : 'hourglass';
                                                    return (
                                                        <div key={h.id||i} style={{padding:'9px 12px',borderRadius:9,background:bg,border:`1px solid ${border}`}}>
                                                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                                                                <span style={{fontSize:12,fontWeight:600,color:col,display:'inline-flex',alignItems:'center',gap:3}}><Icon name={icon} size={12} color={col} />{h.approverName||'Unknown'}</span>
                                                                <span style={{fontSize:10,color:dm?'#4a607f':'#94A3B8',flexShrink:0}}>Round {h.round||1} · {h.actedAt ? new Date(h.actedAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : ''}</span>
                                                            </div>
                                                            {h.comments && <p style={{fontSize:11,color:col,margin:'4px 0 0',opacity:0.85,display:'flex',alignItems:'center',gap:'3px'}}><Icon name={isApproved?'file-edit':'message-square'} size={11} color={col} />{h.comments}</p>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Bootstrap Admin: Delete Ticket ── */}
                                    {isBootAdmin && !['Resolved','Closed'].includes(selectedTicket.status) && (
                                        <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${dm?'rgba(239,68,68,0.15)':'#FEE2E2'}`}}>
                                            {!deleteMode ? (
                                                <button onClick={()=>{setDeleteMode(true);setDeleteJustification('');setActionError('');}}
                                                    style={{width:'100%',padding:'9px',background:'none',border:'1px solid #FCA5A5',color:'#DC2626',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
                                                    <Icon name='trash-2' size={12} color='#DC2626' />Delete Ticket (Bootstrap Admin Only)
                                                </button>
                                            ) : (
                                                <div style={{padding:14,background:dm?'rgba(239,68,68,0.08)':'#FEF2F2',borderRadius:10,border:'1px solid #FECACA'}}>
                                                    <p style={{fontSize:12,fontWeight:700,color:'#991B1B',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='trash-2' size={12} color='#991B1B' />Confirm Ticket Deletion</p>
                                                    <p style={{fontSize:12,color:dm?'#fca5a5':'#DC2626',marginBottom:10}}>This action is permanent and cannot be undone. A justification is required.</p>
                                                    <textarea rows="3" value={deleteJustification} onChange={e=>setDeleteJustification(e.target.value)}
                                                        placeholder="Justification for deleting this ticket…"
                                                        style={{width:'100%',border:'1px solid #FECACA',borderRadius:8,padding:'8px 10px',fontSize:13,resize:'none',boxSizing:'border-box',background:dm?'rgba(8,16,36,0.6)':'white',color:textP,outline:'none',marginBottom:10}}/>
                                                    {actionError && <div style={{fontSize:12,color:'#DC2626',marginBottom:8}}>{actionError}</div>}
                                                    <div style={{display:'flex',gap:8}}>
                                                        <button disabled={actionLoading||!deleteJustification.trim()} onClick={async()=>{
                                                            setActionLoading(true); setActionError('');
                                                            try {
                                                                await API.tickets.delete(selectedTicket._dbId, deleteJustification.trim());
                                                                setTickets(prev=>prev.filter(t=>t._dbId!==selectedTicket._dbId));
                                                                closeDrawer();
                                                            } catch(e){ setActionError(e.message); }
                                                            finally{ setActionLoading(false); }
                                                        }} style={{flex:1,padding:'9px',background:'#DC2626',color:'white',border:'none',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',opacity:(actionLoading||!deleteJustification.trim())?0.5:1}}>
                                                            {actionLoading?<><YCLoader size={13} /><span style={{marginLeft:6}}>Deleting…</span></>:<span style={{display:'inline-flex',alignItems:'center',gap:6,justifyContent:'center'}}><Icon name='trash-2' size={13} color='#fff' />Permanently Delete</span>}
                                                        </button>
                                                        <button onClick={()=>{setDeleteMode(false);setDeleteJustification('');setActionError('');}}
                                                            style={{padding:'9px 14px',background:dm?'rgba(6,9,22,0.7)':'#F5F7FF',color:dm?'#c0cfec':'#334155',border:'none',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })()}
                </main>
            );
        });

        // Calendar Page
        // ── Australian Public Holidays data (2025 + 2026) ──────
        const AU_HOLIDAYS = [
            // ── NATIONAL ──
            { date:'2025-01-01', name:"New Year's Day",          states:['ALL'] },
            { date:'2025-01-27', name:"Australia Day (observed)", states:['ALL'] },
            { date:'2025-04-18', name:"Good Friday",              states:['ALL'] },
            { date:'2025-04-19', name:"Easter Saturday",          states:['ACT','NSW','QLD','SA','VIC'] },
            { date:'2025-04-20', name:"Easter Sunday",            states:['ACT','NSW','QLD','VIC'] },
            { date:'2025-04-21', name:"Easter Monday",            states:['ALL'] },
            { date:'2025-04-25', name:"ANZAC Day",                states:['ALL'] },
            { date:'2025-12-25', name:"Christmas Day",            states:['ALL'] },
            { date:'2025-12-26', name:"Boxing Day",               states:['ALL'] },
            // ── NSW ──
            { date:'2025-06-09', name:"King's Birthday",          states:['NSW','ACT','SA','TAS'] },
            { date:'2025-08-04', name:"Bank Holiday",             states:['NSW'] },
            { date:'2025-10-06', name:"Labour Day",               states:['NSW','ACT','SA'] },
            // ── VIC ──
            { date:'2025-03-10', name:"Labour Day",               states:['VIC'] },
            { date:'2025-06-09', name:"King's Birthday",          states:['VIC'] },
            { date:'2025-09-26', name:"AFL Grand Final Friday",   states:['VIC'] },
            { date:'2025-11-04', name:"Melbourne Cup",            states:['VIC'] },
            // ── QLD ──
            { date:'2025-05-05', name:"Labour Day",               states:['QLD'] },
            { date:'2025-08-13', name:"Royal Queensland Show",    states:['QLD'] },
            { date:'2025-10-06', name:"King's Birthday",          states:['QLD'] },
            // ── SA ──
            { date:'2025-03-03', name:"Adelaide Cup",             states:['SA'] },
            { date:'2025-10-06', name:"Labour Day",               states:['SA'] },
            { date:'2025-12-24', name:"Christmas Eve",            states:['SA'] },
            { date:'2025-12-31', name:"New Year's Eve",           states:['SA'] },
            // ── WA ──
            { date:'2025-03-03', name:"Labour Day",               states:['WA'] },
            { date:'2025-06-02', name:"Western Australia Day",    states:['WA'] },
            { date:'2025-09-22', name:"King's Birthday",          states:['WA'] },
            // ── TAS ──
            { date:'2025-02-10', name:"Royal Hobart Regatta",     states:['TAS'] },
            { date:'2025-03-10', name:"Eight Hours Day",          states:['TAS'] },
            { date:'2025-12-26', name:"Boxing Day",               states:['TAS'] },
            // ── NT ──
            { date:'2025-05-05', name:"May Day",                  states:['NT'] },
            { date:'2025-06-09', name:"King's Birthday",          states:['NT'] },
            { date:'2025-07-14', name:"Picnic Day",               states:['NT'] },
            // ── ACT ──
            { date:'2025-03-10', name:"Canberra Day",             states:['ACT'] },
            { date:'2025-05-26', name:"Reconciliation Day",       states:['ACT'] },
            { date:'2025-06-09', name:"King's Birthday",          states:['ACT'] },
            // ── 2026 NATIONAL ──
            { date:'2026-01-01', name:"New Year's Day",           states:['ALL'] },
            { date:'2026-01-26', name:"Australia Day",            states:['ALL'] },
            { date:'2026-04-03', name:"Good Friday",              states:['ALL'] },
            { date:'2026-04-04', name:"Easter Saturday",          states:['ACT','NSW','QLD','SA','VIC'] },
            { date:'2026-04-05', name:"Easter Sunday",            states:['ACT','NSW','QLD','VIC'] },
            { date:'2026-04-06', name:"Easter Monday",            states:['ALL'] },
            { date:'2026-04-25', name:"ANZAC Day",                states:['ALL'] },
            { date:'2026-12-25', name:"Christmas Day",            states:['ALL'] },
            { date:'2026-12-28', name:"Boxing Day (observed)",    states:['ALL'] },
            // ── 2026 NSW ──
            { date:'2026-06-08', name:"King's Birthday",          states:['NSW','ACT'] },
            { date:'2026-08-03', name:"Bank Holiday",             states:['NSW'] },
            { date:'2026-10-05', name:"Labour Day",               states:['NSW','ACT'] },
            // ── 2026 VIC ──
            { date:'2026-03-09', name:"Labour Day",               states:['VIC'] },
            { date:'2026-06-08', name:"King's Birthday",          states:['VIC'] },
            { date:'2026-11-03', name:"Melbourne Cup",            states:['VIC'] },
            // ── 2026 QLD ──
            { date:'2026-05-04', name:"Labour Day",               states:['QLD'] },
            { date:'2026-10-05', name:"King's Birthday",          states:['QLD'] },
            // ── 2026 SA ──
            { date:'2026-03-02', name:"Adelaide Cup",             states:['SA'] },
            { date:'2026-06-08', name:"King's Birthday",          states:['SA'] },
            { date:'2026-10-05', name:"Labour Day",               states:['SA'] },
            // ── 2026 WA ──
            { date:'2026-03-02', name:"Labour Day",               states:['WA'] },
            { date:'2026-06-01', name:"Western Australia Day",    states:['WA'] },
            { date:'2026-09-28', name:"King's Birthday",          states:['WA'] },
            // ── 2026 TAS ──
            { date:'2026-02-09', name:"Royal Hobart Regatta",     states:['TAS'] },
            { date:'2026-03-09', name:"Eight Hours Day",          states:['TAS'] },
            // ── 2026 NT ──
            { date:'2026-05-04', name:"May Day",                  states:['NT'] },
            { date:'2026-06-08', name:"King's Birthday",          states:['NT'] },
            { date:'2026-07-13', name:"Picnic Day",               states:['NT'] },
            // ── 2026 ACT ──
            { date:'2026-03-09', name:"Canberra Day",             states:['ACT'] },
            { date:'2026-05-25', name:"Reconciliation Day",       states:['ACT'] },
        ];

        const AU_STATES = [
            { code:'ALL', label:'🇦🇺 All Australia (National)' },
            { code:'NSW', label:'New South Wales' },
            { code:'VIC', label:'Victoria' },
            { code:'QLD', label:'Queensland' },
            { code:'SA',  label:'South Australia' },
            { code:'WA',  label:'Western Australia' },
            { code:'TAS', label:'Tasmania' },
            { code:'NT',  label:'Northern Territory' },
            { code:'ACT', label:'Australian Capital Territory' },
        ];

        function CalendarPage() {
            const dm = useDark();
            const cache = useTicketCache(); // shared global cache — no extra fetch needed
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const today = new Date();
            const [calView, setCalView]   = React.useState('month'); // 'month' | 'week' | 'day' | 'agenda'
            const [viewDate, setViewDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
            const [selectedState, setSelectedState] = React.useState('NSW');
            const [selectedDay, setSelectedDay] = React.useState(null);
            const [hoverTicket, setHoverTicket] = React.useState(null); // { ticket, x, y }
            const [dragTicket, setDragTicket]   = React.useState(null); // ticket being dragged
            const [dragOver, setDragOver]       = React.useState(null); // ds string
            // Use tickets from global cache — renders instantly when cache is ready
            const [tickets, setTickets]   = React.useState(() => cache.tickets);
            const [loading, setLoading]   = React.useState(() => !cache.ready);
            const [viewTicket, setViewTicket]   = React.useState(null); // ticket shown in quick-view modal
            const [toast, setToast]             = React.useState(null); // { msg, type }
            const [rescheduling, setRescheduling] = React.useState(false);
            const toastTimer = React.useRef(null);
            const showCalToast = (msg, type='success') => {
                setToast({ msg, type });
                if (toastTimer.current) clearTimeout(toastTimer.current);
                toastTimer.current = setTimeout(() => setToast(null), 3200);
            };
            React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

            // Sync with global cache updates (e.g. 60-second auto-refresh)
            React.useEffect(() => {
                if (cache.ready) {
                    setTickets(cache.tickets);
                    setLoading(false);
                }
            }, [cache.tickets, cache.ready]);

            // ── Helpers ──────────────────────────────────────────
            const pad     = n => String(n).padStart(2,'0');
            const year    = viewDate.getFullYear();
            const month   = viewDate.getMonth();
            const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const MS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
            const fmtDs  = d => `${year}-${pad(month+1)}-${pad(d)}`;
            const isToday = d => today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;

            // Ticket colour
            const ticketColor = t => {
                const s = (t.status||'').toLowerCase();
                const p = (t.priorityLabel||t.priority||'').toLowerCase();
                const od = !['resolved','closed'].includes(s) && t.dueAt && new Date(t.dueAt) < today;
                if (od) return { bar:'#EF4444', bg:dm?'rgba(239,68,68,0.13)':'#FEF2F2', text:'#EF4444', label:'Overdue' };
                if (s==='resolved'||s==='closed') return { bar:'#10B981', bg:dm?'rgba(16,185,129,0.12)':'#ECFDF5', text:'#10B981', label:'Resolved' };
                if (s==='pending_approval')        return { bar:'#833089', bg:dm?'rgba(131,47,138,0.12)':'#F5F3FF', text:'#833089', label:'Approval' };
                if (s==='in_progress')             return { bar:'#3B82F6', bg:dm?'rgba(59,130,246,0.12)':'#EFF6FF', text:'#3B82F6', label:'In Progress' };
                if (p==='critical'||p==='urgent')  return { bar:'#F97316', bg:dm?'rgba(249,115,22,0.12)':'#FFF7ED', text:'#F97316', label:'Critical' };
                if (p==='high')                    return { bar:'#F59E0B', bg:dm?'rgba(245,158,11,0.12)':'#FFFBEB', text:'#F59E0B', label:'High' };
                return { bar:'#833089', bg:dm?'rgba(109,39,115,0.12)':'#F6ECF4', text:'#833089', label:'Open' };
            };
            const isDone    = t => ['resolved','closed'].includes((t.status||'').toLowerCase());
            const isOverdue = t => !isDone(t) && t.dueAt && new Date(t.dueAt) < today;

            // Maps
            const holMap = {};
            AU_HOLIDAYS.forEach(h => {
                if (h.states.includes('ALL') || h.states.includes(selectedState)) {
                    if (!holMap[h.date]) holMap[h.date] = [];
                    holMap[h.date].push(h);
                }
            });
            const tktMap = {};
            tickets.forEach(t => {
                const raw = t.dueAt || t.expectedCompletion;
                if (!raw) return;
                const ds = raw.slice(0,10);
                if (!tktMap[ds]) tktMap[ds] = [];
                tktMap[ds].push(t);
            });

            // Stats
            const moPfx  = `${year}-${pad(month+1)}`;
            const moTkts = tickets.filter(t => (t.dueAt||t.expectedCompletion||'').startsWith(moPfx));
            const mDue   = moTkts.length;
            const mOD    = tickets.filter(isOverdue).length;
            const mRes   = moTkts.filter(isDone).length;
            const wkEnd  = new Date(today); wkEnd.setDate(wkEnd.getDate()+7);
            const wkTkts = tickets.filter(t=>{ const r=t.dueAt||t.expectedCompletion; if(!r) return false; const d=new Date(r); return d>=today&&d<=wkEnd&&!isDone(t); });
            const odList = tickets.filter(isOverdue).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt)).slice(0,10);
            const upHols = AU_HOLIDAYS.filter(h=>{ if(!h.states.includes('ALL')&&!h.states.includes(selectedState)) return false; const d=new Date(h.date),diff=(d-today)/86400000; return diff>=0&&diff<=90; }).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);
            const visibleHols = AU_HOLIDAYS.filter(h=>{ const ok=h.states.includes('ALL')||h.states.includes(selectedState); const [hy,hm]=h.date.split('-').map(Number); return ok&&hy===year&&(hm-1)===month; });

            // Month grid
            const daysInMonth = new Date(year,month+1,0).getDate();
            const monFirst    = (new Date(year,month,1).getDay()+6)%7;
            const cells = [];
            for(let i=0;i<monFirst;i++) cells.push(null);
            for(let d=1;d<=daysInMonth;d++) cells.push(d);
            while(cells.length%7!==0) cells.push(null);
            const weeks = [];
            for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));

            // Week view: get Mon–Sun containing viewDate (use day 1 of month for month-nav, or today if current month)
            const weekAnchor = calView==='week' ? (selectedDay ? new Date(selectedDay) : (year===today.getFullYear()&&month===today.getMonth()?today:new Date(year,month,1))) : today;
            const weekMon = new Date(weekAnchor); weekMon.setDate(weekAnchor.getDate()-((weekAnchor.getDay()+6)%7));
            const weekDays = Array.from({length:7},(_,i)=>{ const d=new Date(weekMon); d.setDate(weekMon.getDate()+i); return d; });

            // Day view
            const dayAnchor = selectedDay ? new Date(selectedDay) : (year===today.getFullYear()&&month===today.getMonth()?today:new Date(year,month,1));
            const dayDs = `${dayAnchor.getFullYear()}-${pad(dayAnchor.getMonth()+1)}-${pad(dayAnchor.getDate())}`;

            // Nav helpers
            const navigate = dir => {
                if (calView==='month')  setViewDate(new Date(year,month+dir,1));
                else if (calView==='week') { const n=new Date(weekAnchor); n.setDate(n.getDate()+dir*7); setViewDate(new Date(n.getFullYear(),n.getMonth(),1)); setSelectedDay(`${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}`); }
                else if (calView==='day')  { const n=new Date(dayAnchor); n.setDate(n.getDate()+dir); setViewDate(new Date(n.getFullYear(),n.getMonth(),1)); setSelectedDay(`${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}`); }
                else setViewDate(new Date(year,month+dir,1));
            };
            const navLabel = () => {
                if (calView==='month') return `${MONTHS[month]} ${year}`;
                if (calView==='week') { const e=weekDays[6]; return `${weekDays[0].getDate()} ${MS[weekDays[0].getMonth()]} – ${e.getDate()} ${MS[e.getMonth()]} ${e.getFullYear()}`; }
                if (calView==='day') return dayAnchor.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
                return `${MONTHS[month]} ${year}`;
            };
            const goNow = () => { setViewDate(new Date(today.getFullYear(),today.getMonth(),1)); setSelectedDay(todayStr); };

            const ST_COLOR = {new:dm?'#6b80a4':'#64748B',assigned:'#3B82F6',in_progress:'#F59E0B',waiting:'#833089',pending_approval:'#833089',resolved:'#10B981',closed:dm?'#6b80a4':'#475569'};
            const ST_LABEL = {new:'New',assigned:'Assigned',in_progress:'In Progress',waiting:'Waiting',pending_approval:'Pending Approval',resolved:'Resolved',closed:'Closed'};

            // Drag handlers — optimistic reschedule, persisted to the backend
            const handleDragStart = (t) => setDragTicket(t);
            const handleDragEnd   = () => { setDragTicket(null); setDragOver(null); };
            const handleDrop = (ds) => {
                if (!dragTicket || !ds) return;
                const t = dragTicket;
                setDragTicket(null); setDragOver(null);
                const prevDue = (t.dueAt || '').slice(0,10);
                if (prevDue === ds) return; // dropped on the same day — no-op
                const newDueIso = ds + 'T00:00:00.000Z';
                const prevTickets = tickets;
                // Optimistic update so the UI feels instant
                setTickets(prev => prev.map(x => x.id===t.id ? {...x, dueAt: newDueIso} : x));
                setRescheduling(true);
                API.tickets.update(t.id, { dueDate: newDueIso }).then(() => {
                    const dLabel = new Date(ds+'T00:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
                    showCalToast(`Rescheduled "${t.title||t.ticketNumber||'Ticket'}" to ${dLabel}`, 'success');
                }).catch(() => {
                    setTickets(prevTickets); // roll back on failure
                    showCalToast('Could not reschedule — please try again', 'error');
                }).finally(() => setRescheduling(false));
            };

            // Tooltip
            const showTip = (t,e) => { const r=e.currentTarget.getBoundingClientRect(); setHoverTicket({ticket:t,x:r.right+8,y:r.top}); };
            const hideTip = () => setHoverTicket(null);

            // ── Shared event bar renderer ─────────────────────────
            const EventBar = ({t, compact=false}) => {
                const c = ticketColor(t);
                return (
                    <div draggable
                        onDragStart={()=>handleDragStart(t)}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={e=>showTip(t,e)}
                        onMouseLeave={hideTip}
                        onClick={e=>{ e.stopPropagation(); setViewTicket(t); }}
                        style={{display:'flex',alignItems:'center',gap:'4px',borderRadius:'5px',padding:compact?'1px 5px':'3px 7px',marginBottom:'2px',background:c.bg,borderLeft:`3px solid ${c.bar}`,cursor:'pointer',fontSize:'11px',fontWeight:'600',color:c.text,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',userSelect:'none',transition:'opacity 0.15s',opacity:dragTicket&&dragTicket.id===t.id?0.4:1}}
                    >
                        <span style={{width:'5px',height:'5px',borderRadius:'50%',background:c.bar,flexShrink:0}}/>
                        <span style={{overflow:'hidden',textOverflow:'ellipsis',flex:1,minWidth:0}}>{t.title||t.ticketNumber||'Ticket'}</span>
                    </div>
                );
            };

            // ── Ticket quick-view modal (click an event to open) ──
            const TicketQuickView = () => {
                if (!viewTicket) return null;
                const t = viewTicket;
                const c = ticketColor(t);
                const od = isOverdue(t), done = isDone(t);
                const sc = ST_COLOR[t.status]||'#9CA3AF';
                const due = t.dueAt || t.expectedCompletion;
                return (
                    <div onClick={()=>setViewTicket(null)} style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
                        <div onClick={e=>e.stopPropagation()} style={{width:'420px',maxWidth:'100%',maxHeight:'85vh',overflowY:'auto',background:dm?'linear-gradient(155deg,rgba(17,30,58,0.99) 0%,rgba(8,16,36,1) 100%)':'white',borderRadius:'16px',border:`1px solid ${dm?'rgba(109,39,115,0.2)':'#E2E8F2'}`,boxShadow:'0 20px 60px rgba(0,0,0,0.35)'}}>
                            {/* Header */}
                            <div style={{padding:'18px 20px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.12)':'#F0F4FF'}`,display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px'}}>
                                <div style={{minWidth:0}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                                        <span style={{fontSize:'11px',fontWeight:'800',color:textM}}>{t.ticketNumber||`#${t.id}`}</span>
                                        <span style={{fontSize:'10px',fontWeight:'700',color:sc,background:sc+'22',borderRadius:'20px',padding:'2px 8px'}}>{ST_LABEL[t.status]||t.status}</span>
                                        {od && <span style={{fontSize:'10px',fontWeight:'700',color:'#EF4444',background:dm?'rgba(239,68,68,0.14)':'#FEF2F2',borderRadius:'20px',padding:'2px 8px',display:'inline-flex',alignItems:'center',gap:3}}><Icon name='alert-triangle' size={9} color='#EF4444' />Overdue</span>}
                                    </div>
                                    <div style={{fontSize:'16px',fontWeight:'800',color:textP,lineHeight:1.35}}>{t.title||'Untitled ticket'}</div>
                                </div>
                                <button onClick={()=>setViewTicket(null)} style={{flexShrink:0,background:dm?'rgba(255,255,255,0.06)':'#F1F5F9',border:'none',borderRadius:'8px',width:'30px',height:'30px',color:textM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='x' size={15} color={textM} /></button>
                            </div>
                            {/* Body */}
                            <div style={{padding:'16px 20px'}}>
                                {t.description && (
                                    <div style={{fontSize:'13px',color:textM,lineHeight:1.6,marginBottom:'16px',whiteSpace:'pre-wrap'}}>{t.description}</div>
                                )}
                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'6px'}}>
                                    <div>
                                        <div style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Priority</div>
                                        <span style={{fontSize:'12px',fontWeight:'700',color:c.text,background:c.bg,borderRadius:'6px',padding:'3px 9px',textTransform:'capitalize',display:'inline-block'}}>{t.priorityLabel||t.priority||'—'}</span>
                                    </div>
                                    <div>
                                        <div style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Category</div>
                                        <div style={{fontSize:'12px',fontWeight:'600',color:textP,textTransform:'capitalize'}}>{t.categoryLabel||t.category||'—'}</div>
                                    </div>
                                    <div>
                                        <div style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Assignee</div>
                                        <div style={{fontSize:'12px',fontWeight:'600',color:textP}}>{t.assigneeName||'Unassigned'}{t.assigneeActive===false && <ExStaffBadge />}</div>
                                    </div>
                                    <div>
                                        <div style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Due Date</div>
                                        <div style={{fontSize:'12px',fontWeight:'600',color:od?'#EF4444':textP}}>{due?new Date(due).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}):'—'}</div>
                                    </div>
                                    {t.createdAt && (
                                        <div>
                                            <div style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Created</div>
                                            <div style={{fontSize:'12px',fontWeight:'600',color:textP}}>{new Date(t.createdAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}</div>
                                        </div>
                                    )}
                                    {t.isEscalated && (
                                        <div>
                                            <div style={{fontSize:'10px',fontWeight:'700',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Escalated</div>
                                            <span style={{fontSize:'11px',fontWeight:'700',color:'#D97706',background:dm?'rgba(245,158,11,0.14)':'#FFFBEB',borderRadius:'6px',padding:'2px 8px'}}>Yes</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Footer actions */}
                            <div style={{padding:'14px 20px',borderTop:`1px solid ${dm?'rgba(109,39,115,0.12)':'#F0F4FF'}`,display:'flex',gap:'10px'}}>
                                <button onClick={()=>setViewTicket(null)} style={{flex:'0 0 auto',padding:'9px 16px',borderRadius:'9px',border:`1px solid ${borderC}`,background:'transparent',color:textM,fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Close</button>
                                <button onClick={()=>{ window.location.hash='tickets'; }} style={{flex:1,padding:'9px 16px',borderRadius:'9px',border:'none',background:'#6D2773',color:'white',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Open in Tickets →</button>
                            </div>
                        </div>
                    </div>
                );
            };

            // ── Ticket tooltip ────────────────────────────────────
            const TicketTooltip = () => {
                if (!hoverTicket) return null;
                const {ticket:t, x, y} = hoverTicket;
                const c = ticketColor(t);
                const od = isOverdue(t), done = isDone(t);
                const sc = ST_COLOR[t.status]||'#9CA3AF';
                return (
                    <div style={{position:'fixed',left:Math.min(x,window.innerWidth-280),top:Math.min(y,window.innerHeight-200),zIndex:9999,width:'260px',background:dm?'rgba(10,18,40,0.98)':'white',borderRadius:'10px',boxShadow:'0 8px 32px rgba(0,0,0,0.25)',border:`1px solid ${dm?'rgba(109,39,115,0.25)':c.bar+'33'}`,padding:'12px',pointerEvents:'none'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                            <span style={{fontSize:'10px',fontWeight:'700',color:textM}}>{t.ticketNumber||`#${t.id}`}</span>
                            <span style={{fontSize:'10px',fontWeight:'600',color:sc,background:sc+'22',borderRadius:'20px',padding:'1px 7px'}}>{ST_LABEL[t.status]||t.status}</span>
                        </div>
                        <div style={{fontSize:'13px',fontWeight:'700',color:textP,marginBottom:'8px',lineHeight:1.3}}>{t.title||'—'}</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginBottom:'8px'}}>
                            <span style={{fontSize:'10px',fontWeight:'600',color:c.text,background:c.bg,borderRadius:'4px',padding:'2px 7px'}}>{c.label}</span>
                            {(t.priorityLabel||t.priority) && <span style={{fontSize:'10px',fontWeight:'600',color:dm?'#8fa4cc':'#64748B',background:dm?'rgba(109,39,115,0.1)':'#F1F5F9',borderRadius:'4px',padding:'2px 7px',textTransform:'capitalize'}}>{t.priorityLabel||t.priority}</span>}
                        </div>
                        {t.assigneeName && <div style={{fontSize:'11px',color:textM,marginBottom:'4px',display:'flex',alignItems:'center',gap:4}}><Icon name='user' size={10} color={textM} />{t.assigneeName}</div>}
                        {t.dueAt && <div style={{fontSize:'11px',color:od?'#EF4444':textM,display:'flex',alignItems:'center',gap:4}}><Icon name='calendar' size={10} color={od?'#EF4444':textM} />Due: {new Date(t.dueAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}{od?' · Overdue':''}</div>}
                    </div>
                );
            };

            // ── MONTH VIEW ────────────────────────────────────────
            const MonthView = () => (
                <div style={{flex:1}}>
                    {/* Day headers */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:dm?'rgba(6,9,20,0.5)':'#F8FAFC',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.1)':'#EEF2F8'}`}}>
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>(
                            <div key={d} style={{textAlign:'center',fontSize:'11px',fontWeight:'700',letterSpacing:'0.06em',color:i>=5?(dm?'#3d5070':'#94A3B8'):(dm?'#6b80a4':'#64748B'),padding:'10px 0',textTransform:'uppercase'}}>{d}</div>
                        ))}
                    </div>
                    {/* Grid */}
                    {weeks.map((wk,wi)=>(
                        <div key={wi} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
                            {wk.map((d,di)=>{
                                const ds    = d ? fmtDs(d) : null;
                                const hols  = ds?(holMap[ds]||[]):[];
                                const tkts  = ds?(tktMap[ds]||[]):[];
                                const dow   = d ? new Date(year,month,d).getDay() : null;
                                const isWknd= dow===0||dow===6;
                                const isTd  = d&&isToday(d);
                                const isHol = hols.length>0;
                                const isSel = selectedDay===ds;
                                const isDO  = ds===dragOver;
                                const odCnt = tkts.filter(isOverdue).length;
                                const isLast= wi===weeks.length-1;
                                return (
                                    <div key={di}
                                        className={`gc-cell${isTd?' today-cell':''}${isSel?' sel-cell':''}${isHol&&!isSel?' hol-cell':''}${isWknd&&!isHol&&!isSel?' wknd-cell':''}`}
                                        onClick={()=>d&&setSelectedDay(isSel?null:ds)}
                                        onDragOver={e=>{if(dragTicket&&d){e.preventDefault();setDragOver(ds);}}}
                                        onDragLeave={()=>setDragOver(null)}
                                        onDrop={()=>handleDrop(ds)}
                                        style={{minHeight:'116px',padding:'0 0 2px',cursor:d?'pointer':'default',borderBottom:isLast?'none':`1px solid ${dm?'rgba(109,39,115,0.07)':'#EEF2F8'}`,borderRight:di===6?'none':`1px solid ${dm?'rgba(109,39,115,0.07)':'#EEF2F8'}`,position:'relative',overflow:'hidden',background:isDO?(dm?'rgba(109,39,115,0.12)':'#EFF6FF'):!d?(dm?'rgba(0,0,0,0.12)':'#F8FAFC'):undefined,outline:isDO?`2px dashed ${dm?'rgba(109,39,115,0.5)':'#833089'}`:'none',transition:'background 0.1s'}}
                                    >
                                        {d && (<>
                                            {/* Top accent stripe */}
                                            {isHol && <div style={{position:'absolute',top:0,left:0,right:0,height:'2.5px',background:'#DC2626'}}/>}
                                            {!isHol && odCnt>0 && <div style={{position:'absolute',top:0,left:0,right:0,height:'2.5px',background:'#C2410C'}}/>}
                                            {/* Date row */}
                                            <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 6px 3px'}}>
                                                <div style={{width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:isTd?'800':'500',background:isTd?'#833089':'transparent',color:isTd?'white':isWknd?(dm?'#3d5070':'#94A3B8'):(dm?'#c0cfec':'#334155'),boxShadow:isTd?'0 2px 8px rgba(109,39,115,0.5)':'none',flexShrink:0}}>{d}</div>
                                                {isHol && <span style={{fontSize:'9px',color:'#EF4444',fontWeight:'700',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{hols[0].name}</span>}
                                                {tkts.length>0 && !isHol && <span style={{fontSize:'9px',fontWeight:'800',color:odCnt>0?'#EF4444':(dm?'#C77DB8':'#833089'),background:odCnt>0?(dm?'rgba(239,68,68,0.15)':'#FEF2F2'):(dm?'rgba(109,39,115,0.15)':'#F6ECF4'),borderRadius:'8px',padding:'1px 5px',flexShrink:0}}>{tkts.length}</span>}
                                            </div>
                                            {/* Events */}
                                            <div style={{padding:'0 3px'}}>
                                                {tkts.slice(0,3).map((t,ti)=><EventBar key={ti} t={t} compact />)}
                                                {tkts.length>3 && <div style={{fontSize:'9.5px',color:dm?'#4a607f':'#94A3B8',padding:'1px 5px',fontWeight:'600'}}>+{tkts.length-3} more</div>}
                                            </div>
                                        </>)}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            );

            // ── WEEK VIEW ─────────────────────────────────────────
            const WeekView = () => (
                <div style={{flex:1,overflowX:'auto'}}>
                    <div style={{minWidth:'700px'}}>
                        {/* Day headers */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:dm?'rgba(6,9,20,0.5)':'#F8FAFC',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.1)':'#EEF2F8'}`}}>
                            {weekDays.map((d,i)=>{
                                const ds=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
                                const isWknd=d.getDay()===0||d.getDay()===6;
                                const isTd=ds===todayStr;
                                const isSel=selectedDay===ds;
                                return (
                                    <div key={i} onClick={()=>setSelectedDay(isSel?null:ds)} style={{textAlign:'center',padding:'12px 4px 10px',cursor:'pointer',borderRight:i===6?'none':`1px solid ${dm?'rgba(109,39,115,0.07)':'#EEF2F8'}`,background:isSel?(dm?'rgba(109,39,115,0.12)':'#EFF6FF'):undefined}}>
                                        <div style={{fontSize:'10px',fontWeight:'700',color:isWknd?(dm?'#3d5070':'#94A3B8'):(dm?'#6b80a4':'#64748B'),textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'4px'}}>{DAYS_SHORT[d.getDay()]}</div>
                                        <div style={{width:'30px',height:'30px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:isTd?'800':'600',background:isTd?'#833089':isSel?(dm?'rgba(109,39,115,0.2)':'#E3BFDA'):'transparent',color:isTd?'white':(dm?'#c0cfec':'#334155'),margin:'0 auto',boxShadow:isTd?'0 2px 8px rgba(109,39,115,0.4)':'none'}}>{d.getDate()}</div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Event rows */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
                            {weekDays.map((d,i)=>{
                                const ds=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
                                const hols=holMap[ds]||[];
                                const tkts=tktMap[ds]||[];
                                const isWknd=d.getDay()===0||d.getDay()===6;
                                const isDO=ds===dragOver;
                                return (
                                    <div key={i}
                                        onDragOver={e=>{if(dragTicket){e.preventDefault();setDragOver(ds);}}}
                                        onDragLeave={()=>setDragOver(null)}
                                        onDrop={()=>handleDrop(ds)}
                                        style={{minHeight:'200px',padding:'8px 4px',borderRight:i===6?'none':`1px solid ${dm?'rgba(109,39,115,0.07)':'#EEF2F8'}`,background:isDO?(dm?'rgba(109,39,115,0.1)':'#EFF6FF'):isWknd?(dm?'rgba(255,255,255,0.01)':'#FAFAFA'):undefined,outline:isDO?`2px dashed ${dm?'rgba(109,39,115,0.4)':'#833089'}`:'none',transition:'background 0.1s'}}>
                                        {hols.map((h,hi)=>(
                                            <div key={hi} style={{display:'flex',alignItems:'center',gap:'3px',background:dm?'rgba(239,68,68,0.1)':'#FFF5F5',borderRadius:'5px',padding:'2px 5px',marginBottom:'3px',fontSize:'10px',fontWeight:'700',color:'#EF4444',border:`1px solid ${dm?'rgba(239,68,68,0.2)':'#FECACA'}`}}>
                                                <span>🇦🇺</span><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.name}</span>
                                            </div>
                                        ))}
                                        {tkts.map((t,ti)=><EventBar key={ti} t={t} />)}
                                        {tkts.length===0&&hols.length===0 && <div style={{fontSize:'10px',color:dm?'#2a3a5a':'#D1D5DB',textAlign:'center',marginTop:'20px'}}>—</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );

            // ── DAY VIEW ──────────────────────────────────────────
            const DayView = () => {
                const hols = holMap[dayDs]||[];
                const tkts = tktMap[dayDs]||[];
                const isWknd = dayAnchor.getDay()===0||dayAnchor.getDay()===6;
                return (
                    <div style={{flex:1,padding:'20px 24px'}}>
                        {/* Day header */}
                        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'20px'}}>
                            <div style={{width:'56px',height:'56px',borderRadius:'14px',background:dayDs===todayStr?'#6D2773':(dm?'rgba(109,39,115,0.1)':'rgba(109,39,115,0.08)'),display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                                <div style={{fontSize:'10px',fontWeight:'800',color:dayDs===todayStr?'rgba(255,255,255,0.8)':(dm?'#6b80a4':'#94A3B8'),textTransform:'uppercase',letterSpacing:'0.1em'}}>{MS[dayAnchor.getMonth()]}</div>
                                <div style={{fontSize:'22px',fontWeight:'800',color:dayDs===todayStr?'white':(dm?'#c0cfec':'#1E293B'),lineHeight:1}}>{dayAnchor.getDate()}</div>
                            </div>
                            <div>
                                <div style={{fontSize:'18px',fontWeight:'800',color:textP}}>{DAYS_FULL[dayAnchor.getDay()]}</div>
                                <div style={{fontSize:'12px',color:textM,marginTop:'2px'}}>{dayAnchor.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})}</div>
                            </div>
                            {dayDs===todayStr && <span style={{fontSize:'11px',fontWeight:'700',color:'#833089',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',borderRadius:'20px',padding:'3px 10px',border:`1px solid ${dm?'rgba(109,39,115,0.3)':'#E3BFDA'}`}}>Today</span>}
                        </div>
                        {/* Public holidays */}
                        {hols.length>0 && (
                            <div style={{marginBottom:'16px'}}>
                                <div style={{fontSize:'11px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'8px'}}>Public Holidays</div>
                                {hols.map((h,i)=>(
                                    <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',background:dm?'rgba(239,68,68,0.08)':'#FFF5F5',border:`1px solid ${dm?'rgba(239,68,68,0.2)':'#FECACA'}`,borderRadius:'10px',padding:'10px 14px',marginBottom:'8px'}}>
                                        <span style={{fontSize:'18px'}}>🇦🇺</span>
                                        <div>
                                            <div style={{fontSize:'13px',fontWeight:'700',color:'#EF4444'}}>{h.name}</div>
                                            <div style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',marginTop:'2px'}}>{h.states.includes('ALL')?'National holiday':'Applies to: '+h.states.join(', ')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Tickets */}
                        <div style={{fontSize:'11px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'8px'}}>Tickets Due — {tkts.length}</div>
                        {tkts.length===0 ? (
                            <div style={{textAlign:'center',padding:'40px 20px',color:dm?'#4a607f':'#94A3B8',fontSize:'13px'}}>
                                <div style={{marginBottom:'8px',display:'flex',justifyContent:'center'}}><Icon name='check-circle' size={26} color={dm?'#4a607f':'#94A3B8'} /></div>
                                No tickets due on this day
                            </div>
                        ) : tkts.map((t,i)=>{
                            const c=ticketColor(t), od=isOverdue(t), done=isDone(t);
                            const sc=ST_COLOR[t.status]||'#9CA3AF';
                            return (
                                <div key={i} draggable onDragStart={()=>handleDragStart(t)} onDragEnd={handleDragEnd} onClick={()=>setViewTicket(t)}
                                    style={{display:'flex',alignItems:'flex-start',gap:'12px',background:dm?'rgba(255,255,255,0.02)':'white',border:`1px solid ${dm?'rgba(109,39,115,0.1)':c.bar+'33'}`,borderLeft:`4px solid ${c.bar}`,borderRadius:'10px',padding:'12px 14px',marginBottom:'8px',cursor:'pointer',transition:'box-shadow 0.15s',boxShadow:dm?'0 2px 8px rgba(0,0,0,0.3)':'0 1px 4px rgba(0,0,0,0.06)'}}>
                                    <div style={{width:'36px',height:'36px',borderRadius:'8px',background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                        <div style={{width:'10px',height:'10px',borderRadius:'50%',background:c.bar}}/>
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
                                            <span style={{fontSize:'11px',fontWeight:'700',color:textM}}>{t.ticketNumber||`#${t.id}`}</span>
                                            <span style={{fontSize:'10px',fontWeight:'600',color:sc,background:sc+'22',borderRadius:'20px',padding:'2px 8px'}}>{ST_LABEL[t.status]||t.status}</span>
                                        </div>
                                        <div style={{fontSize:'14px',fontWeight:'700',color:textP,marginBottom:'6px'}}>{t.title||'—'}</div>
                                        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                                            <span style={{fontSize:'10px',fontWeight:'600',color:c.text,background:c.bg,borderRadius:'4px',padding:'2px 7px'}}>{c.label}</span>
                                            {(t.priorityLabel||t.priority) && <span style={{fontSize:'10px',fontWeight:'600',color:dm?'#8fa4cc':'#64748B',background:dm?'rgba(109,39,115,0.1)':'#F1F5F9',borderRadius:'4px',padding:'2px 7px',textTransform:'capitalize'}}>{t.priorityLabel||t.priority}</span>}
                                            {t.assigneeName && <span style={{fontSize:'10px',color:textM,display:'inline-flex',alignItems:'center',gap:3}}><Icon name='user' size={9} color={textM} />{t.assigneeName}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            };

            // ── AGENDA VIEW ───────────────────────────────────────
            const AgendaView = () => {
                // Collect all events from viewDate forward, grouped by date
                const start = new Date(year, month, 1);
                const end   = new Date(year, month+3, 0);
                const groups = {};
                tickets.forEach(t => {
                    const raw = t.dueAt||t.expectedCompletion;
                    if (!raw) return;
                    const ds=raw.slice(0,10);
                    const d=new Date(ds);
                    if (d>=start&&d<=end) { if(!groups[ds]) groups[ds]=[]; groups[ds].push({type:'ticket',data:t}); }
                });
                AU_HOLIDAYS.forEach(h => {
                    if (!h.states.includes('ALL')&&!h.states.includes(selectedState)) return;
                    const d=new Date(h.date);
                    if (d>=start&&d<=end) { if(!groups[h.date]) groups[h.date]=[]; groups[h.date].push({type:'holiday',data:h}); }
                });
                const sortedDates = Object.keys(groups).sort();
                if (sortedDates.length===0) return (
                    <div style={{textAlign:'center',padding:'60px 20px',color:dm?'#4a607f':'#94A3B8'}}>
                        <div style={{marginBottom:'10px',display:'flex',justifyContent:'center'}}><Icon name='calendar' size={30} color={dm?'#4a607f':'#94A3B8'} /></div>
                        <div style={{fontSize:'14px',fontWeight:'600'}}>No events in the next 3 months</div>
                    </div>
                );
                return (
                    <div style={{flex:1,overflowY:'auto',maxHeight:'600px'}}>
                        {sortedDates.map(ds=>{
                            const [dy,dm2,dd]=ds.split('-').map(Number);
                            const dateObj=new Date(dy,dm2-1,dd);
                            const isTd=ds===todayStr;
                            const items=groups[ds]||[];
                            const tkts=items.filter(i=>i.type==='ticket').map(i=>i.data);
                            const hols=items.filter(i=>i.type==='holiday').map(i=>i.data);
                            return (
                                <div key={ds} style={{display:'flex',gap:'0',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.07)':'#EEF2F8'}`}}>
                                    {/* Date column */}
                                    <div style={{width:'80px',flexShrink:0,padding:'14px 12px',textAlign:'center',background:isTd?(dm?'rgba(109,39,115,0.08)':'#F5F3FF'):undefined}}>
                                        <div style={{fontSize:'10px',fontWeight:'700',color:isTd?(dm?'#C77DB8':'#833089'):(dm?'#4a607f':'#94A3B8'),textTransform:'uppercase',letterSpacing:'0.06em'}}>{MS[dm2-1]}</div>
                                        <div style={{fontSize:'22px',fontWeight:'800',color:isTd?(dm?'#C77DB8':'#833089'):(dm?'#c0cfec':'#1E293B'),lineHeight:1,margin:'2px 0'}}>{dd}</div>
                                        <div style={{fontSize:'9px',color:dm?'#3d5070':'#94A3B8',textTransform:'uppercase'}}>{DAYS_SHORT[dateObj.getDay()]}</div>
                                        {isTd && <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#833089',margin:'4px auto 0'}}/>}
                                    </div>
                                    {/* Events column */}
                                    <div style={{flex:1,padding:'10px 16px 10px 8px'}}>
                                        {hols.map((h,i)=>(
                                            <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',background:dm?'rgba(239,68,68,0.07)':'#FFF5F5',border:`1px solid ${dm?'rgba(239,68,68,0.15)':'#FECACA'}`,borderRadius:'8px',padding:'8px 10px',marginBottom:'6px'}}>
                                                <span>🇦🇺</span>
                                                <div>
                                                    <div style={{fontSize:'12px',fontWeight:'700',color:'#EF4444'}}>{h.name}</div>
                                                    <div style={{fontSize:'10px',color:dm?'#4a607f':'#94A3B8'}}>{h.states.includes('ALL')?'National':h.states.join(', ')}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {tkts.map((t,i)=>{
                                            const c=ticketColor(t);
                                            const sc=ST_COLOR[t.status]||'#9CA3AF';
                                            return (
                                                <div key={i} draggable onDragStart={()=>handleDragStart(t)} onDragEnd={handleDragEnd} onClick={()=>setViewTicket(t)}
                                                    style={{display:'flex',alignItems:'center',gap:'10px',background:dm?'rgba(255,255,255,0.02)':'white',border:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`,borderLeft:`3px solid ${c.bar}`,borderRadius:'8px',padding:'8px 10px',marginBottom:'5px',cursor:'pointer'}}>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontSize:'12px',fontWeight:'700',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title||'—'}</div>
                                                        <div style={{display:'flex',gap:'6px',marginTop:'3px',alignItems:'center'}}>
                                                            <span style={{fontSize:'10px',fontWeight:'600',color:c.text}}>{c.label}</span>
                                                            {t.assigneeName && <span style={{fontSize:'10px',color:textM}}>· {t.assigneeName.split(' ')[0]}</span>}
                                                        </div>
                                                    </div>
                                                    <span style={{fontSize:'10px',fontWeight:'600',color:sc,background:sc+'22',borderRadius:'20px',padding:'2px 8px',flexShrink:0,whiteSpace:'nowrap'}}>{ST_LABEL[t.status]||t.status}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            };

            return (
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    <style>{`
                        .gc-cell { transition: background 0.1s; }
                        .gc-cell:hover { background: ${dm?'rgba(109,39,115,0.05)':'#FAFBFF'} !important; }
                        .gc-cell.today-cell { background: ${dm?'rgba(109,39,115,0.06)':'#FEFEFF'} !important; }
                        .gc-cell.sel-cell   { background: ${dm?'rgba(109,39,115,0.12)':'#EFF6FF'} !important; }
                        .gc-cell.hol-cell   { background: ${dm?'rgba(239,68,68,0.04)':'#FFF8F8'} !important; }
                        .gc-cell.wknd-cell  { background: ${dm?'rgba(0,0,0,0.08)':'#FAFAFA'} !important; }
                        .cal-view-btn { transition: all 0.15s; border:none; cursor:pointer; border-radius:7px; font-size:12px; font-weight:600; padding:5px 12px; }
                        .cal-view-btn.active { background: ${dm?'rgba(109,39,115,0.25)':'white'} !important; color: ${dm?'#DDA8D1':'#6D2773'} !important; box-shadow: ${dm?'none':'0 1px 3px rgba(0,0,0,0.12)'}; }
                        .cal-view-btn:not(.active) { background:transparent !important; color:${dm?'#6b80a4':'#64748B'} !important; }
                        .cal-view-btn:not(.active):hover { background:${dm?'rgba(109,39,115,0.08)':'#F1F5F9'} !important; }
                        .ev-bar-wrap:hover { filter:brightness(${dm?'1.1':'0.95'}); }
                        .sidebar-row:hover { background:${dm?'rgba(109,39,115,0.06)':'#F9FAFB'} !important; border-radius:8px; }
                        .cal-nav-btn { transition:all 0.15s; }
                        .cal-nav-btn:hover { background:${dm?'rgba(109,39,115,0.12)':'#F3F4F6'} !important; }
                    `}</style>

                    {/* Floating tooltip */}
                    <TicketTooltip />

                    {/* Ticket quick-view modal */}
                    <TicketQuickView />

                    {/* Reschedule toast */}
                    {toast && (
                        <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:10001,display:'flex',alignItems:'center',gap:'10px',padding:'12px 20px',borderRadius:'12px',background:toast.type==='error'?'#DC2626':'#111827',color:'white',fontSize:'13px',fontWeight:'600',boxShadow:'0 12px 32px rgba(0,0,0,0.35)',border:toast.type==='error'?'1px solid rgba(255,255,255,0.15)':`1px solid ${dm?'rgba(109,39,115,0.3)':'rgba(255,255,255,0.1)'}`}}>
                            <Icon name={toast.type==='error'?'alert-triangle':'check-circle'} size={15} color={toast.type==='error'?'#FCA5A5':'#34D399'} />
                            <span>{toast.msg}</span>
                        </div>
                    )}

                    <div style={{maxWidth:'1600px',margin:'0 auto',padding:'20px 24px'}}>

                        {/* ══ TOP STATS BAR ══ */}
                        <div style={{display:'flex',gap:'10px',marginBottom:'18px',flexWrap:'wrap'}}>
                            {[
                                {label:'Due This Month',value:mDue,  color:'#833089',bg:dm?'rgba(109,39,115,0.12)':'#F6ECF4',  icon:'calendar'},
                                {label:'Overdue',       value:mOD,   color:'#EF4444',bg:dm?'rgba(239,68,68,0.12)':'#FEF2F2',   icon:'alert-triangle'},
                                {label:'Resolved',      value:mRes,  color:'#10B981',bg:dm?'rgba(16,185,129,0.12)':'#ECFDF5',  icon:'check-circle'},
                                {label:'Due This Week', value:wkTkts.length,color:'#F59E0B',bg:dm?'rgba(245,158,11,0.12)':'#FFFBEB',icon:'bell'},
                            ].map(s=>(
                                <div key={s.label} style={{display:'flex',alignItems:'center',gap:'10px',background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'10px 16px',boxShadow:dm?'0 4px 12px rgba(0,0,0,0.35)':'0 1px 3px rgba(0,0,0,0.05)',flex:'1 1 150px',minWidth:'140px'}}>
                                    <div style={{width:'34px',height:'34px',borderRadius:'9px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                        <Icon name={s.icon} size={16} color={s.color} />
                                    </div>
                                    <div>
                                        <div style={{fontSize:'20px',fontWeight:'800',color:s.color,lineHeight:1}}>{s.value}</div>
                                        <div style={{fontSize:'11px',color:textM,marginTop:'2px'}}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ══ MAIN LAYOUT ══ */}
                        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'16px',alignItems:'start'}}>

                            {/* ── CALENDAR CARD ── */}
                            <div style={{background:cardBg,borderRadius:'16px',border:`1px solid ${borderC}`,overflow:'hidden',boxShadow:dm?'0 4px 6px rgba(0,0,0,0.4),0 20px 60px rgba(0,0,0,0.55)':'0 1px 6px rgba(0,0,0,0.07)'}}>

                                {/* Header bar */}
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.1)':'#F0F4FF'}`,gap:'10px',flexWrap:'wrap'}}>
                                    {/* Left: title + sub */}
                                    <div>
                                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                            <h1 style={{fontSize:'17px',fontWeight:'800',color:textP,margin:0,letterSpacing:'-0.3px'}}>Ticket Calendar</h1>
                                            {rescheduling && <span style={{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:'700',color:'#833089',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',borderRadius:'20px',padding:'2px 9px'}}><YCLoader size={10} />Saving…</span>}
                                        </div>
                                        <p style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',margin:'2px 0 0'}}>Due dates · public holidays · drag to reschedule</p>
                                    </div>
                                    {/* Right: state selector + today */}
                                    <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                                        <select value={selectedState} onChange={e=>setSelectedState(e.target.value)}
                                            style={{padding:'5px 10px',borderRadius:'8px',border:`1px solid ${borderC}`,background:dm?'rgba(2,8,23,0.9)':'white',fontSize:'12px',color:textM,cursor:'pointer',outline:'none'}}>
                                            {AU_STATES.map(s=><option key={s.code} value={s.code}>{s.label}</option>)}
                                        </select>
                                        <button onClick={goNow} className="cal-nav-btn" style={{padding:'5px 14px',borderRadius:'8px',border:`1px solid ${borderC}`,background:dm?'rgba(109,39,115,0.1)':'white',fontSize:'12px',fontWeight:'700',color:dm?'#E3BFDA':'#6D2773',cursor:'pointer'}}>Today</button>
                                    </div>
                                </div>

                                {/* View switcher + nav */}
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 18px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#F0F4FF'}`,gap:'10px',flexWrap:'wrap'}}>
                                    {/* Nav arrows + label */}
                                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                        <button className="cal-nav-btn" onClick={()=>navigate(-1)} style={{width:'30px',height:'30px',borderRadius:'8px',border:`1px solid ${borderC}`,background:dm?'rgba(109,39,115,0.06)':'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:textM,fontSize:'15px'}}>‹</button>
                                        <div style={{fontSize:'14px',fontWeight:'700',color:textP,minWidth:'180px',textAlign:'center'}}>{navLabel()}</div>
                                        <button className="cal-nav-btn" onClick={()=>navigate(1)} style={{width:'30px',height:'30px',borderRadius:'8px',border:`1px solid ${borderC}`,background:dm?'rgba(109,39,115,0.06)':'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:textM,fontSize:'15px'}}>›</button>
                                    </div>
                                    {/* View tabs */}
                                    <div style={{display:'flex',gap:'4px',background:dm?'rgba(0,0,0,0.3)':'#F1F5F9',borderRadius:'9px',padding:'3px'}}>
                                        {[{v:'month',l:'Month'},{v:'week',l:'Week'},{v:'day',l:'Day'},{v:'agenda',l:'Agenda'}].map(({v,l})=>(
                                            <button key={v} className={`cal-view-btn${calView===v?' active':''}`} onClick={()=>setCalView(v)}>{l}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* View body */}
                                {loading ? (
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'300px',gap:'10px',color:textM}}>
                                        <YCLoader size={20} /><span style={{fontSize:'13px'}}>Loading tickets…</span>
                                    </div>
                                ) : (
                                    <>
                                        {calView==='month'  && <MonthView />}
                                        {calView==='week'   && <WeekView />}
                                        {calView==='day'    && <DayView />}
                                        {calView==='agenda' && <AgendaView />}
                                    </>
                                )}

                                {/* Legend footer */}
                                <div style={{display:'flex',flexWrap:'wrap',gap:'12px',padding:'10px 18px',borderTop:`1px solid ${dm?'rgba(109,39,115,0.08)':'#F0F4FF'}`,background:dm?'rgba(4,8,20,0.4)':'#FAFBFF',alignItems:'center'}}>
                                    {[
                                        {bar:'#833089', label:'Open'},
                                        {bar:'#3B82F6', label:'In Progress'},
                                        {bar:'#EF4444', label:'Overdue'},
                                        {bar:'#10B981', label:'Resolved'},
                                        {bar:'#F97316', label:'Critical'},
                                        {hol:true,      label:'Holiday'},
                                        {today:true,    label:'Today'},
                                    ].map((l,i)=>(
                                        <div key={i} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                                            {l.today && <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#833089',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:'800',color:'white',boxShadow:'0 1px 4px rgba(109,39,115,0.5)'}}>9</div>}
                                            {l.bar   && <div style={{width:'10px',height:'10px',borderRadius:'3px',background:l.bar}}/>}
                                            {l.hol   && <span>🇦🇺</span>}
                                            <span style={{fontSize:'10px',color:dm?'#6b80a4':'#64748B',fontWeight:'500'}}>{l.label}</span>
                                        </div>
                                    ))}
                                    <div style={{marginLeft:'auto',fontSize:'10px',color:dm?'#3d5070':'#CBD5E1'}}>Drag events to reschedule</div>
                                </div>
                            </div>

                            {/* ── RIGHT SIDEBAR ── */}
                            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>

                                {/* Selected day panel */}
                                {selectedDay && (()=>{
                                    const [sy,sm2,sd2] = selectedDay.split('-').map(Number);
                                    const hols = holMap[selectedDay]||[];
                                    const tkts = tktMap[selectedDay]||[];
                                    const dl = new Date(sy,sm2-1,sd2).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
                                    return (
                                        <div style={{background:cardBg,borderRadius:'13px',border:`1px solid ${borderC}`,overflow:'hidden'}}>
                                            <div style={{background:'#6D2773',padding:'13px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                                <div>
                                                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.06em'}}>Selected Day</div>
                                                    <div style={{fontSize:'14px',fontWeight:'800',color:'white',marginTop:'2px'}}>{dl}</div>
                                                </div>
                                                <button onClick={()=>setSelectedDay(null)} style={{background:'rgba(255,255,255,0.18)',border:'none',borderRadius:'7px',width:'28px',height:'28px',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='x' size={15} color='#fff' /></button>
                                            </div>
                                            <div style={{padding:'12px 14px'}}>
                                                {hols.length===0&&tkts.length===0 && <p style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',margin:0,textAlign:'center',padding:'8px 0'}}>No tickets or holidays</p>}
                                                {hols.map((h,i)=>(
                                                    <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',background:dm?'rgba(239,68,68,0.08)':'#FFF5F5',borderRadius:'8px',padding:'8px 10px',marginBottom:'6px',border:`1px solid ${dm?'rgba(239,68,68,0.15)':'#FECACA'}`}}>
                                                        <span style={{fontSize:'16px'}}>🇦🇺</span>
                                                        <div><div style={{fontSize:'12px',fontWeight:'700',color:'#EF4444'}}>{h.name}</div><div style={{fontSize:'10px',color:dm?'#4a607f':'#94A3B8',marginTop:'1px'}}>{h.states.includes('ALL')?'National':h.states.join(', ')}</div></div>
                                                    </div>
                                                ))}
                                                {tkts.length>0 && <>
                                                    <div style={{fontSize:'10px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.06em',margin:'6px 0 8px'}}>{tkts.length} Ticket{tkts.length!==1?'s':''}</div>
                                                    {tkts.map((t,i)=>{
                                                        const c=ticketColor(t),od=isOverdue(t),done=isDone(t),sc=ST_COLOR[t.status]||'#9CA3AF';
                                                        return (
                                                            <div key={i} onClick={()=>setViewTicket(t)} style={{borderLeft:`3px solid ${c.bar}`,background:dm?'rgba(255,255,255,0.02)':c.bg,borderRadius:'0 8px 8px 0',padding:'8px 10px',marginBottom:'6px',cursor:'pointer'}}>
                                                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'3px'}}>
                                                                    <span style={{fontSize:'10px',fontWeight:'700',color:textM}}>{t.ticketNumber||`#${t.id}`}</span>
                                                                    <span style={{fontSize:'10px',fontWeight:'600',color:sc,background:sc+'22',borderRadius:'20px',padding:'1px 7px'}}>{ST_LABEL[t.status]||t.status}</span>
                                                                </div>
                                                                <div style={{fontSize:'12px',fontWeight:'700',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title||'—'}</div>
                                                                <div style={{display:'flex',gap:'5px',marginTop:'4px',flexWrap:'wrap'}}>
                                                                    {(t.priorityLabel||t.priority) && <span style={{fontSize:'10px',color:c.text,fontWeight:'600',textTransform:'capitalize'}}>{t.priorityLabel||t.priority}</span>}
                                                                    {od && <span style={{fontSize:'10px',color:'#EF4444',fontWeight:'700',display:'inline-flex',alignItems:'center',gap:2}}><Icon name='alert-triangle' size={9} color='#EF4444' />Overdue</span>}
                                                                    {done && <span style={{fontSize:'10px',color:'#10B981',fontWeight:'700',display:'inline-flex',alignItems:'center',gap:2}}><Icon name='check' size={9} color='#10B981' />Done</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </>}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Overdue tickets */}
                                {odList.length>0 && (
                                <div style={{background:cardBg,borderRadius:'13px',border:`1px solid ${dm?'rgba(239,68,68,0.22)':'#FECACA'}`,overflow:'hidden',boxShadow:dm?'0 4px 16px rgba(0,0,0,0.35)':'0 1px 4px rgba(0,0,0,0.06)'}}>
                                    <div style={{padding:'11px 15px',borderBottom:`1px solid ${dm?'rgba(239,68,68,0.1)':'#FEF2F2'}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:dm?'rgba(239,68,68,0.06)':'#FFF5F5'}}>
                                        <span style={{fontSize:'12px',fontWeight:'800',color:'#EF4444',display:'inline-flex',alignItems:'center',gap:5}}><Icon name='alert-triangle' size={13} color='#EF4444' />Overdue</span>
                                        <span style={{fontSize:'11px',background:dm?'rgba(239,68,68,0.18)':'#FEE2E2',color:'#EF4444',borderRadius:'20px',padding:'2px 9px',fontWeight:'800'}}>{odList.length}</span>
                                    </div>
                                    <div style={{padding:'6px 8px',maxHeight:'220px',overflowY:'auto'}}>
                                        {odList.map((t,i)=>{
                                            const c=ticketColor(t);
                                            const daysOver=t.dueAt?Math.floor((today-new Date(t.dueAt))/86400000):null;
                                            return (
                                                <div key={i} className="sidebar-row" onClick={()=>setViewTicket(t)} style={{padding:'7px 6px',borderRadius:'7px',display:'flex',gap:'8px',alignItems:'center',cursor:'pointer'}}>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontSize:'12px',fontWeight:'600',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title||'—'}</div>
                                                        <div style={{fontSize:'10px',color:textM,marginTop:'1px'}}>{(t.priorityLabel||t.priority||'').charAt(0).toUpperCase()+(t.priorityLabel||t.priority||'').slice(1)}{t.assigneeName?` · ${t.assigneeName.split(' ')[0]}`:''}</div>
                                                    </div>
                                                    {daysOver!=null && <span style={{fontSize:'10px',fontWeight:'800',color:'#EF4444',background:dm?'rgba(239,68,68,0.14)':'#FEF2F2',borderRadius:'20px',padding:'2px 7px',whiteSpace:'nowrap',flexShrink:0}}>{daysOver}d</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                )}

                                {/* Due this week */}
                                {wkTkts.length>0 && (
                                <div style={{background:cardBg,borderRadius:'13px',border:`1px solid ${borderC}`,overflow:'hidden',boxShadow:dm?'0 4px 16px rgba(0,0,0,0.35)':'0 1px 4px rgba(0,0,0,0.06)'}}>
                                    <div style={{padding:'11px 15px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.1)':'#EEF2F8'}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontSize:'12px',fontWeight:'800',color:textP,display:'inline-flex',alignItems:'center',gap:5}}><Icon name='bell' size={13} color='#F59E0B' />Due This Week</span>
                                        <span style={{fontSize:'11px',background:dm?'rgba(245,158,11,0.14)':'#FFFBEB',color:'#D97706',borderRadius:'20px',padding:'2px 9px',fontWeight:'800'}}>{wkTkts.length}</span>
                                    </div>
                                    <div style={{padding:'6px 8px'}}>
                                        {wkTkts.slice(0,6).map((t,i)=>{
                                            const c=ticketColor(t);
                                            const d=new Date(t.dueAt);
                                            const diffD=Math.round((d-today)/86400000);
                                            const dLabel=diffD===0?'Today':diffD===1?'Tmrw':`${diffD}d`;
                                            return (
                                                <div key={i} className="sidebar-row" onClick={()=>setViewTicket(t)} style={{padding:'7px 6px',borderRadius:'7px',display:'flex',gap:'8px',alignItems:'center',cursor:'pointer'}}>
                                                    <div style={{width:'32px',height:'32px',background:dm?'rgba(245,158,11,0.1)':'#FFFBEB',borderRadius:'8px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                                        <div style={{fontSize:'8px',fontWeight:'800',color:'#D97706',textTransform:'uppercase'}}>{MS[d.getMonth()]}</div>
                                                        <div style={{fontSize:'14px',fontWeight:'800',color:'#92400E',lineHeight:1}}>{d.getDate()}</div>
                                                    </div>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontSize:'12px',fontWeight:'600',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title||'—'}</div>
                                                        <div style={{fontSize:'10px',color:c.text,fontWeight:'600',marginTop:'1px',textTransform:'capitalize'}}>{t.priorityLabel||t.priority||''}{t.assigneeName?` · ${t.assigneeName.split(' ')[0]}`:''}</div>
                                                    </div>
                                                    <span style={{fontSize:'10px',fontWeight:'800',color:diffD===0?'#EF4444':'#D97706',flexShrink:0}}>{dLabel}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                )}

                                {/* Upcoming holidays */}
                                <div style={{background:cardBg,borderRadius:'13px',border:`1px solid ${borderC}`,overflow:'hidden',boxShadow:dm?'0 4px 16px rgba(0,0,0,0.35)':'0 1px 4px rgba(0,0,0,0.06)'}}>
                                    <div style={{padding:'11px 15px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.1)':'#EEF2F8'}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontSize:'12px',fontWeight:'800',color:textP,display:'inline-flex',alignItems:'center',gap:'5px'}}>🇦🇺 Public Holidays</span>
                                        <span style={{fontSize:'10px',color:textM}}>Next 90 days</span>
                                    </div>
                                    <div style={{padding:'6px 8px'}}>
                                        {upHols.length===0 ? (
                                            <p style={{fontSize:'12px',color:textM,textAlign:'center',padding:'12px',margin:0}}>None in the next 90 days</p>
                                        ) : upHols.map((h,i)=>{
                                            const [hy,hm2,hd2]=h.date.split('-').map(Number);
                                            const diff=Math.round((new Date(hy,hm2-1,hd2)-today)/86400000);
                                            const dLabel=diff===0?'Today':diff===1?'Tmrw':`${diff}d`;
                                            const hot=diff<=7;
                                            return (
                                                <div key={i} className="sidebar-row" style={{padding:'7px 6px',borderRadius:'7px',display:'flex',gap:'8px',alignItems:'center'}}>
                                                    <div style={{width:'32px',height:'32px',background:hot?(dm?'rgba(239,68,68,0.1)':'#FEF2F2'):(dm?'rgba(109,39,115,0.08)':'#F5F7FF'),borderRadius:'8px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                                        <div style={{fontSize:'8px',fontWeight:'800',color:hot?'#DC2626':(dm?'#4a607f':'#64748B'),textTransform:'uppercase'}}>{MS[hm2-1]}</div>
                                                        <div style={{fontSize:'14px',fontWeight:'800',color:hot?'#991B1B':(dm?'#8fa4cc':'#334155'),lineHeight:1}}>{hd2}</div>
                                                    </div>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontSize:'12px',fontWeight:'600',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.name}</div>
                                                        <div style={{fontSize:'10px',color:textM,marginTop:'1px'}}>{h.states.includes('ALL')?'National':h.states.join(', ')}</div>
                                                    </div>
                                                    <span style={{fontSize:'10px',fontWeight:'800',color:hot?'#DC2626':textM,flexShrink:0}}>{dLabel}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Priority breakdown */}
                                {moTkts.length>0 && (()=>{
                                    const PRI_C={critical:{dot:'#EF4444',bg:dm?'rgba(239,68,68,0.12)':'#FEF2F2'},high:{dot:'#F59E0B',bg:dm?'rgba(245,158,11,0.12)':'#FFFBEB'},medium:{dot:'#3B82F6',bg:dm?'rgba(59,130,246,0.12)':'#EFF6FF'},low:{dot:'#10B981',bg:dm?'rgba(16,185,129,0.12)':'#ECFDF5'}};
                                    const priCounts={};
                                    moTkts.forEach(t=>{const p=(t.priorityLabel||t.priority||'low').toLowerCase(); priCounts[p]=(priCounts[p]||0)+1;});
                                    return (
                                        <div style={{background:cardBg,borderRadius:'13px',border:`1px solid ${borderC}`,padding:'13px 15px',boxShadow:dm?'0 4px 16px rgba(0,0,0,0.35)':'0 1px 4px rgba(0,0,0,0.06)'}}>
                                            <div style={{fontSize:'12px',fontWeight:'800',color:textP,marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='bar-chart' size={13} color={dm?'#C77DB8':'#833089'} />{MONTHS[month]} Breakdown</div>
                                            {['critical','high','medium','low'].map(p=>{
                                                const cnt=priCounts[p]||0; if(!cnt) return null;
                                                const pc=PRI_C[p]||{dot:'#94A3B8',bg:'#F1F5F9'};
                                                const pct=Math.round(cnt/moTkts.length*100);
                                                return (
                                                    <div key={p} style={{marginBottom:'9px'}}>
                                                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',marginBottom:'4px',alignItems:'center'}}>
                                                            <span style={{fontWeight:'700',color:pc.dot,textTransform:'capitalize',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:pc.dot,display:'inline-block'}}/>{p}</span>
                                                            <span style={{color:textM,fontWeight:'600'}}>{cnt} ({pct}%)</span>
                                                        </div>
                                                        <div style={{height:'7px',background:dm?'rgba(109,39,115,0.08)':'#F1F5F9',borderRadius:'4px',overflow:'hidden'}}>
                                                            <div style={{height:'100%',width:pct+'%',background:pc.dot,borderRadius:'4px',transition:'width 0.6s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}

                            </div>{/* end sidebar */}
                        </div>
                    </div>
                </main>
            );
        }

        const ACTION_META = {
            created:          { label: 'Created',          bg: '#DCFCE7', color: '#166534' },
            assigned:         { label: 'Assigned',          bg: '#DBEAFE', color: '#1E40AF' },
            status_changed:   { label: 'Status Changed',    bg: '#EDE9FE', color: '#6D28D9' },
            resolved:         { label: 'Resolved',          bg: '#D1FAE5', color: '#065F46' },
            approved:         { label: 'Approved',          bg: '#D1FAE5', color: '#065F46' },
            rejected:         { label: 'Rejected',          bg: '#FEE2E2', color: '#991B1B' },
            escalated:        { label: 'Escalated',         bg: '#FEF3C7', color: '#92400E' },
            commented:        { label: 'Comment',           bg: '#EEF2F8', color: '#475569' },
            priority_changed: { label: 'Priority Changed',  bg: '#FFF7ED', color: '#C2410C' },
            due_date_changed: { label: 'Due Date Changed',  bg: '#F5F3FF', color: '#6D28D9' },
            reopened:         { label: 'Reopened',          bg: '#DBEAFE', color: '#1E40AF' },
            closed:           { label: 'Closed',            bg: '#F0FDF4', color: '#14532D' },
        };

        const PRIORITY_META = {
            critical: { bg: '#FEE2E2', color: '#991B1B' },
            high:     { bg: '#FEF3C7', color: '#92400E' },
            medium:   { bg: '#DBEAFE', color: '#1E40AF' },
            low:      { bg: '#F0FDF4', color: '#166534' },
        };

        function fmtDate(iso) {
            if (!iso) return '—';
            const d = new Date(iso);
            return d.toLocaleString('en-AU', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });
        }

        function detailSummary(action, details) {
            if (!details) return '';
            if (action === 'status_changed') return `${details.from || '?'} → ${details.to || '?'}`;
            if (action === 'assigned')       return details.to ? `to user #${details.to}` : '';
            if (action === 'priority_changed') return `${details.from || '?'} → ${details.to || '?'}`;
            if (action === 'escalated')      return details.escalatedTo ? `to ${details.escalatedTo}${details.reason ? ` — ${details.reason}` : ''}` : '';
            if (action === 'rejected')       return details.justification ? `"${details.justification.substring(0,60)}"` : '';
            return '';
        }

        // ─── Staff Performance Page ───────────────────────────────
        // Metrics: assigned, resolved, pending, resolution rate,
        //          avg resolution time, SLA compliance, escalations,
        //          overdue, high/critical tickets + auto insights
        const StaffPerformancePage = React.memo(function StaffPerformancePage() {
            const dm = useDark();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const [loading, setLoading]         = React.useState(true);
            const [staffMetrics, setStaffMetrics] = React.useState([]);
            const [summary, setSummary]         = React.useState({});
            const [insights, setInsights]       = React.useState([]);
            const [sortBy, setSortBy]           = React.useState('resolved');
            const [sortDir, setSortDir]         = React.useState('desc');
            const [perfChart, setPerfChart]     = React.useState(null);

            React.useEffect(() => {
                (async () => {
                    try {
                        const su = getSessionUser();
                        const uqp = getUserQueryParams(su);
                        const tsp = getTicketScopeParams(su);
                        const tParams = new URLSearchParams({ all:'1', limit:'500' });
                        if (tsp.scope)  tParams.set('scope',  tsp.scope);
                        if (tsp.userId) tParams.set('userId', String(tsp.userId));
                        if (tsp.deptId) tParams.set('deptId', String(tsp.deptId));
                        const [usersRes, ticketsRes] = await Promise.all([
                            fetch(`${HRMS_API}/users?status=active&limit=200${uqp}`),
                            fetch(`${HRMS_API}/tickets?${tParams}`),
                        ]);
                        const usersData   = usersRes.ok   ? await usersRes.json()   : { users: [] };
                        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : { tickets: [] };
                        const tickets = ticketsData.tickets || [];
                        const users   = usersData.users   || [];
                        const now = Date.now();

                        const isResolved = t => {
                            const s = (t.status || t.statusLabel || '').toString().toLowerCase();
                            return t.isClosed || s === 'resolved' || s === 'closed';
                        };

                        // ── Per-staff metrics ──────────────────────────────
                        const metrics = users.map(u => {
                            const mine        = tickets.filter(t => t.assigneeId != null && Number(t.assigneeId) === Number(u.id));
                            const resolved    = mine.filter(isResolved);
                            const pending     = mine.filter(t => !isResolved(t));
                            const withinSla   = resolved.filter(t => !t.slaBreached);
                            const sla         = resolved.length ? Math.round((withinSla.length / resolved.length) * 100) : null;
                            const resRate     = mine.length ? Math.round((resolved.length / mine.length) * 100) : null;

                            // Average resolution time (hours)
                            const durations = resolved
                                .filter(t => t.resolvedAt && t.createdAt)
                                .map(t => (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000);
                            const avgHours = durations.length ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : null;

                            // Escalations: tickets in their queue that were escalated
                            const escalated = mine.filter(t => t.isEscalated).length;

                            // Overdue: open tickets past due date
                            const overdue = pending.filter(t => t.dueAt && new Date(t.dueAt) < now).length;

                            // High/Critical tickets
                            const criticalHigh = mine.filter(t => {
                                const p = (t.priority || t.priorityLabel || '').toString().toLowerCase();
                                return p === 'critical' || p === 'high';
                            }).length;

                            const initials = (u.name || '?').split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase();
                            return {
                                id: u.id, name: u.name, initials,
                                dept: u.department_name || '—',
                                assigned: mine.length,
                                resolved: resolved.length,
                                pending: pending.length,
                                resRate, sla, avgHours,
                                escalated, overdue, criticalHigh,
                            };
                        }).filter(m => m.assigned > 0)
                          .sort((a,b) => b.resolved - a.resolved);

                        // ── Team summary ──────────────────────────────────
                        // Derived from the same ticket set backing the per-staff table below
                        // (tickets assigned to a currently-active, fetched staff member) so the
                        // KPI row always reconciles with what the table actually shows. Tickets
                        // assigned to an inactive/unfetched user are excluded from both.
                        const includedIds = new Set(metrics.map(m => Number(m.id)));
                        const scopedTickets = tickets.filter(t => t.assigneeId != null && includedIds.has(Number(t.assigneeId)));

                        const totalTickets   = scopedTickets.length;
                        const totalResolved  = scopedTickets.filter(isResolved).length;
                        const totalAssigned  = totalTickets;
                        const totalEscalated = scopedTickets.filter(t => t.isEscalated).length;
                        const totalOverdue   = scopedTickets.filter(t => !isResolved(t) && t.dueAt && new Date(t.dueAt) < now).length;
                        const resolvedWithSla = scopedTickets.filter(t => isResolved(t) && !t.slaBreached).length;
                        const teamSla = totalResolved > 0 ? Math.round((resolvedWithSla / totalResolved) * 100) : 0;
                        const allDurs = scopedTickets
                            .filter(t => isResolved(t) && t.resolvedAt && t.createdAt)
                            .map(t => (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000);
                        const teamAvgHours = allDurs.length ? Math.round(allDurs.reduce((a,b)=>a+b,0)/allDurs.length) : null;

                        // ── Auto-generate insights ─────────────────────────
                        const ins = [];
                        if (metrics.length > 0) {
                            const top = metrics[0];
                            if (top.resolved > 0) ins.push({ type:'positive', icon:'award', text:`${top.name} leads the team with ${top.resolved} ticket${top.resolved>1?'s':''} resolved${top.resRate!==null?' ('+top.resRate+'% resolution rate)':''}.` });

                            const withAvg = metrics.filter(m => m.avgHours !== null);
                            if (withAvg.length > 0) {
                                const fastest = withAvg.reduce((a,b) => a.avgHours < b.avgHours ? a : b);
                                ins.push({ type:'positive', icon:'zap', text:`${fastest.name} resolves tickets fastest — average ${fastest.avgHours}h per ticket.` });
                            }

                            const overdueStaff = metrics.filter(m => m.overdue > 0);
                            if (overdueStaff.length > 0) {
                                const total = overdueStaff.reduce((a,m) => a+m.overdue, 0);
                                ins.push({ type:'danger', icon:'alert-octagon', text:`${total} overdue ticket${total>1?'s':''} across ${overdueStaff.length} staff member${overdueStaff.length>1?'s':''} (${overdueStaff.map(m=>m.name).join(', ')}) — immediate attention needed.` });
                            }

                            const highEsc = [...metrics].sort((a,b)=>b.escalated-a.escalated)[0];
                            if (highEsc && highEsc.escalated > 0) ins.push({ type:'warning', icon:'arrow-up-circle', text:`${highEsc.name} has ${highEsc.escalated} escalated ticket${highEsc.escalated>1?'s':''} in their queue — review workload or complexity.` });

                            const slaRisk = metrics.filter(m => m.sla !== null && m.sla < 70);
                            if (slaRisk.length > 0) ins.push({ type:'warning', icon:'clock', text:`${slaRisk.map(m=>m.name+' ('+m.sla+'%)').join(', ')} ${slaRisk.length===1?'is':'are'} below 70% SLA — may need process support.` });

                            const perfect = metrics.filter(m => m.sla === 100 && m.resolved >= 3);
                            if (perfect.length > 0) ins.push({ type:'positive', icon:'sparkles', text:`${perfect.map(m=>m.name).join(' & ')} ${perfect.length===1?'has':'have'} maintained 100% SLA compliance.` });

                            const highWorkload = metrics.filter(m => m.pending > 4);
                            if (highWorkload.length > 0) ins.push({ type:'info', icon:'clipboard-list', text:`${highWorkload.map(m=>m.name+' ('+m.pending+' open)').join(', ')} ${highWorkload.length===1?'has':'have'} high open-ticket load — consider redistributing.` });

                            const lowRes = metrics.filter(m => m.assigned >= 3 && m.resRate !== null && m.resRate < 30);
                            if (lowRes.length > 0) ins.push({ type:'warning', icon:'activity', text:`${lowRes.map(m=>m.name).join(', ')} ${lowRes.length===1?'has':'have'} a low resolution rate (under 30%) — check for blockers.` });
                        }
                        if (ins.length === 0) ins.push({ type:'info', icon:'bar-chart-2', text:'Assign tickets to staff members to start generating performance insights.' });

                        setStaffMetrics(metrics);
                        setSummary({ totalTickets, totalResolved, totalAssigned, totalEscalated, totalOverdue, teamSla, teamAvgHours });
                        setInsights(ins);
                        setLoading(false);
                    } catch(e) {
                        console.error('StaffPerformancePage', e);
                        setLoading(false);
                    }
                })();
            }, []);

            // ── Chart ─────────────────────────────────────────────
            React.useEffect(() => {
                if (loading || staffMetrics.length === 0) return;
                loadChartJs().then(() => {
                const ctx = document.getElementById('perfChart');
                if (!ctx) return;
                if (perfChart) { try { perfChart.destroy(); } catch(_){} }
                const sorted = [...staffMetrics].sort((a,b) => b.assigned - a.assigned);
                const chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: sorted.map(s => s.name.split(' ')[0]),
                        datasets: [
                            { label: 'Assigned',  data: sorted.map(s => s.assigned),  backgroundColor: 'rgba(109,39,115,0.7)',  borderRadius: 4 },
                            { label: 'Resolved',  data: sorted.map(s => s.resolved),  backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 4 },
                            { label: 'Escalated', data: sorted.map(s => s.escalated), backgroundColor: 'rgba(239,68,68,0.7)',   borderRadius: 4 },
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: true,
                        plugins: { legend: { display: true, position: 'top' } },
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }, x: { grid: { display: false } } }
                    }
                });
                setPerfChart(chart);
                }); // end loadChartJs().then
            }, [loading, staffMetrics]);

            // ── Sorted table rows ─────────────────────────────────
            const sorted = React.useMemo(() => {
                return [...staffMetrics].sort((a,b) => {
                    const va = a[sortBy] ?? -1;
                    const vb = b[sortBy] ?? -1;
                    return sortDir === 'desc' ? vb - va : va - vb;
                });
            }, [staffMetrics, sortBy, sortDir]);

            const toggleSort = col => {
                if (sortBy === col) setSortDir(d => d==='desc'?'asc':'desc');
                else { setSortBy(col); setSortDir('desc'); }
            };

            const top3 = [...staffMetrics].sort((a,b)=>b.resolved-a.resolved).slice(0,3);
            const RANK_COLOR = ['#A0824F','#8B8F94','#A0896F'];
            const slaColor = v => v===null?'#9CA3AF':v>=80?'#10B981':v>=60?'#F59E0B':'#EF4444';
            const insightBg = {positive:'#F0FDF4',warning:'#FFFBEB',danger:'#FEF2F2',info:'#EFF6FF'};
            const insightBorder = {positive:'#BBF7D0',warning:'#FDE68A',danger:'#FECACA',info:'#BFDBFE'};
            const insightText = {positive:'#166534',warning:'#92400E',danger:'#991B1B',info:'#1E40AF'};

            const SortTh = ({ col, label }) => (
                <th onClick={() => toggleSort(col)} style={{padding:'10px 12px',textAlign:'left',fontWeight:'600',color: sortBy===col?'#5D2162':(dm?'#8fa4cc':'#64748B'),fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.05em',cursor:'pointer',whiteSpace:'nowrap',userSelect:'none'}}>
                    {label} {sortBy===col ? (sortDir==='desc'?'↓':'↑') : ''}
                </th>
            );

            return (
                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="p-8 max-w-7xl mx-auto">
                        <div className="mb-7">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Performance</h1>
                            <p className="text-sm text-gray-400 mt-1">Live metrics for tickets assigned to active staff</p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-24">
                                <SectionLoader message="Loading performance data…" size={40} />
                            </div>
                        ) : (
                        <>
                        {/* ── KPI row ── */}
                        <div className="yc-stat-5 grid gap-4 mb-7" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
                            {[
                                { label:'Total Tickets',   value: summary.totalTickets,              icon:'ticket', color:dm?'#C77DB8':'#6D2773' },
                                { label:'Resolved',        value: summary.totalResolved,             icon:'check-circle', color:'#10B981' },
                                { label:'Team SLA',        value: (summary.teamSla||0)+'%',          icon:'clock', color: summary.teamSla>=80?'#10B981':summary.teamSla>=60?'#F59E0B':'#EF4444' },
                                { label:'Avg Resolve Time',value: summary.teamAvgHours!=null?summary.teamAvgHours+'h':'—', icon:'clock', color:dm?'#C77DB8':'#6D2773' },
                                { label:'Overdue',         value: summary.totalOverdue||0,           icon:'alert-octagon', color: summary.totalOverdue>0?'#EF4444':'#10B981' },
                            ].map((s,i) => (
                                <div key={i} style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'18px 20px',boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                                        <Icon name={s.icon} size={16} />
                                        <span style={{fontSize:'11px',fontWeight:'600',color:dm?'#4a607f':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</span>
                                    </div>
                                    <div style={{fontSize:'28px',fontWeight:'800',color:s.color}}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── Insights ── */}
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'20px 24px',marginBottom:'24px',boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                            <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,marginBottom:'14px',display:'flex',alignItems:'center',gap:'8px'}}>
                                <Icon name='sparkles' size={15} color={dm?'#C77DB8':'#6D2773'} /> Performance Insights
                            </h2>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'10px'}}>
                                {insights.map((ins,i) => (
                                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'12px 14px',borderRadius:'10px',background:insightBg[ins.type],border:'1px solid '+insightBorder[ins.type]}}>
                                        <Icon name={ins.icon} size={16} style={{flexShrink:0,marginTop:'1px'}} />
                                        <p style={{fontSize:'12px',lineHeight:'1.6',color:insightText[ins.type],margin:0}}>{ins.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Top performers podium ── */}
                        {top3.length > 0 && (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'20px 24px',marginBottom:'24px',boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                            <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,marginBottom:'16px',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='star' size={14} color='#F59E0B' />Top Performers</h2>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
                                {top3.map((s,idx) => (
                                    <div key={s.id} style={{border:`1px solid ${borderC}`,borderRadius:'12px',padding:'20px',textAlign:'center',background:cardBg}}>
                                        <div style={{width:'30px',height:'30px',borderRadius:'50%',background:RANK_COLOR[idx],display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}><Icon name='award' size={15} color='#fff' /></div>
                                        <div style={{width:'44px',height:'44px',borderRadius:'50%',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:'#5D2162',fontWeight:'800',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>{s.initials}</div>
                                        <div style={{fontWeight:'700',fontSize:'13px',color:textP,marginBottom:'2px'}}>{s.name}</div>
                                        <div style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',marginBottom:'12px'}}>{s.dept}</div>
                                        <div style={{display:'flex',justifyContent:'center',gap:'16px'}}>
                                            <div><div style={{fontWeight:'800',fontSize:'18px',color:'#10B981'}}>{s.resolved}</div><div style={{fontSize:'10px',color:dm?'#4a607f':'#94A3B8'}}>Resolved</div></div>
                                            <div><div style={{fontWeight:'800',fontSize:'18px',color:dm?'#C77DB8':'#6D2773'}}>{s.assigned}</div><div style={{fontSize:'10px',color:dm?'#4a607f':'#94A3B8'}}>Assigned</div></div>
                                            <div><div style={{fontWeight:'800',fontSize:'18px',color:slaColor(s.sla)}}>{s.sla!==null?s.sla+'%':'—'}</div><div style={{fontSize:'10px',color:dm?'#4a607f':'#94A3B8'}}>SLA</div></div>
                                        </div>
                                        {s.avgHours!==null && <div style={{marginTop:'10px',fontSize:'11px',color:textM,display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}><Icon name='zap' size={11} color={textM} /> Avg {s.avgHours}h resolve time</div>}
                                        {s.escalated>0 && <div style={{marginTop:'4px',fontSize:'11px',color:'#EF4444',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}><Icon name='arrow-up-circle' size={11} color='#EF4444' /> {s.escalated} escalated</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* ── Full metrics table ── */}
                        {staffMetrics.length > 0 ? (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'20px 24px',marginBottom:'24px',boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
                                <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='clipboard-list' size={14} color={dm?'#C77DB8':'#6D2773'} />All Staff Metrics</h2>
                                <span style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8'}}>Click column headers to sort</span>
                            </div>
                            <div className="yc-table-scroll">
                                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                                    <thead>
                                        <tr style={{borderBottom:'2px solid #F3F4F6'}}>
                                            <th style={{padding:'10px 12px',textAlign:'left',fontWeight:'600',color:textM,fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Staff</th>
                                            <th style={{padding:'10px 12px',textAlign:'left',fontWeight:'600',color:textM,fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Dept</th>
                                            <SortTh col="assigned"    label="Assigned" />
                                            <SortTh col="resolved"    label="Resolved" />
                                            <SortTh col="pending"     label="Pending" />
                                            <SortTh col="resRate"     label="Res. Rate" />
                                            <SortTh col="avgHours"    label="Avg Time" />
                                            <SortTh col="sla"         label="SLA" />
                                            <SortTh col="escalated"   label="Escalated" />
                                            <SortTh col="overdue"     label="Overdue" />
                                            <SortTh col="criticalHigh" label="High/Crit" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sorted.map((s,i) => (
                                            <tr key={s.id} style={{borderBottom:`1px solid ${borderC}`,background:i%2===0?(dm?'rgba(255,255,255,0.02)':'#fff'):(dm?'rgba(109,39,115,0.03)':'#FAFAFA'),transition:'background 0.15s'}}
                                                onMouseEnter={e=>e.currentTarget.style.background=dm?'rgba(109,39,115,0.10)':'#F5F3FF'}
                                                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?(dm?'rgba(255,255,255,0.02)':'#fff'):(dm?'rgba(109,39,115,0.03)':'#FAFAFA')}>
                                                <td style={{padding:'11px 12px'}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                        <div style={{width:'30px',height:'30px',borderRadius:'50%',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:'#5D2162',fontWeight:'700',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.initials}</div>
                                                        <span style={{fontWeight:'600',color:textP}}>{s.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{padding:'11px 12px',color:textM,fontSize:'12px'}}>{s.dept}</td>
                                                <td style={{padding:'11px 12px',fontWeight:'700',color:dm?'#c0cfec':'#334155',textAlign:'center'}}>{s.assigned}</td>
                                                <td style={{padding:'11px 12px',fontWeight:'700',color:'#10B981',textAlign:'center'}}>{s.resolved}</td>
                                                <td style={{padding:'11px 12px',fontWeight:'600',color:s.pending>0?'#F59E0B':(dm?'#4a607f':'#94A3B8'),textAlign:'center'}}>{s.pending}</td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {s.resRate!==null ? (
                                                        <span style={{fontWeight:'700',color:s.resRate>=70?'#10B981':s.resRate>=40?'#F59E0B':'#EF4444'}}>{s.resRate}%</span>
                                                    ) : <span style={{color:'#D1D5DB'}}>—</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',color:textM,textAlign:'center'}}>{s.avgHours!==null?s.avgHours+'h':'—'}</td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {s.sla!==null ? (
                                                        <span style={{fontWeight:'700',color:slaColor(s.sla)}}>{s.sla}%</span>
                                                    ) : <span style={{color:'#D1D5DB'}}>—</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {s.escalated>0
                                                        ? <span style={{background:dm?'rgba(239,68,68,0.15)':'#FEF2F2',color:dm?'#fca5a5':'#DC2626',fontWeight:'700',padding:'2px 8px',borderRadius:'6px',fontSize:'12px'}}>{s.escalated}</span>
                                                        : <span style={{color:'#D1D5DB'}}>0</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {s.overdue>0
                                                        ? <span style={{background:dm?'rgba(249,115,22,0.15)':'#FFF7ED',color:dm?'#fdba74':'#EA580C',fontWeight:'700',padding:'2px 8px',borderRadius:'6px',fontSize:'12px'}}>{s.overdue}</span>
                                                        : <span style={{color:'#D1D5DB'}}>0</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {s.criticalHigh>0
                                                        ? <span style={{background:dm?'rgba(190,18,60,0.15)':'#FFF1F2',color:dm?'#fda4af':'#BE123C',fontWeight:'700',padding:'2px 8px',borderRadius:'6px',fontSize:'12px'}}>{s.criticalHigh}</span>
                                                        : <span style={{color:'#D1D5DB'}}>0</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ) : (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'48px',textAlign:'center',marginBottom:'24px'}}>
                            <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='inbox' size={40} color={dm?'#4a607f':'#94A3B8'} /></div>
                            <p style={{color:dm?'#4a607f':'#94A3B8',fontSize:'14px'}}>No tickets assigned to staff yet — metrics appear once tickets have assignees.</p>
                        </div>
                        )}

                        {/* ── Chart ── */}
                        {staffMetrics.length > 0 && (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'20px 24px',boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                            <h2 style={{fontSize:'14px',fontWeight:'700',color:textP,marginBottom:'16px',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='bar-chart' size={14} color={dm?'#C77DB8':'#6D2773'} />Assigned / Resolved / Escalated by Staff</h2>
                            <div className="chart-container"><canvas id="perfChart"></canvas></div>
                        </div>
                        )}
                        </>
                        )}
                    </div>
                </main>
            );
        });

        // ── Team insight helpers ─────────────────────────────────
        const isResT = t => { const s=(t.status||'').toLowerCase(); return t.isClosed||s==='resolved'||s==='closed'; };

        function genDeptInsights(d) {
            const ins = [];
            if (d.resRate !== null) {
                if (d.resRate >= 80) ins.push({ type:'positive', msg:`Strong resolution rate of ${d.resRate}% — team is closing tickets efficiently.` });
                else if (d.resRate >= 50) ins.push({ type:'warning', msg:`Moderate resolution rate of ${d.resRate}% — ${d.pending} tickets still open.` });
                else ins.push({ type:'danger', msg:`Low resolution rate of ${d.resRate}% — ${d.pending} tickets still pending action.` });
            }
            if (d.sla !== null) {
                if (d.sla >= 80) ins.push({ type:'positive', msg:`SLA compliance healthy at ${d.sla}%.` });
                else if (d.sla >= 60) ins.push({ type:'warning', msg:`SLA compliance at ${d.sla}% — some tickets are breaching deadlines.` });
                else ins.push({ type:'danger', msg:`Only ${d.sla}% SLA compliance — deadlines consistently missed.` });
            }
            if (d.escalated > 0) ins.push({ type: d.escalated > 2 ? 'danger' : 'warning', msg:`${d.escalated} ticket${d.escalated>1?'s':''} escalated — review workload distribution.` });
            else if (d.assigned > 0) ins.push({ type:'positive', msg:`No escalations — team handles tickets without needing to escalate.` });
            if (d.overdue > 0) ins.push({ type:'danger', msg:`${d.overdue} overdue ticket${d.overdue>1?'s':''} — immediate attention required.` });
            if (d.avgHours !== null) {
                if (d.avgHours > 72) ins.push({ type:'warning', msg:`Avg resolution time of ${Math.round(d.avgHours/24)}d is above target — consider workload balancing.` });
                else if (d.avgHours <= 8) ins.push({ type:'positive', msg:`Excellent avg resolution time of ${d.avgHours}h.` });
                else ins.push({ type:'info', msg:`Avg resolution time: ${d.avgHours >= 24 ? Math.round(d.avgHours/24)+'d' : d.avgHours+'h'}.` });
            }
            if (d.criticalHigh > 0 && d.assigned > 0) {
                const pct = Math.round((d.criticalHigh/d.assigned)*100);
                ins.push({ type: pct > 50 ? 'warning' : 'info', msg:`${pct}% of tickets are Critical/High priority (${d.criticalHigh} of ${d.assigned}).` });
            }
            if (d.staff > 0 && d.assigned > 0) {
                const ratio = (d.assigned / d.staff).toFixed(1);
                ins.push({ type: ratio > 8 ? 'warning' : 'info', msg:`${ratio} tickets per staff member on average.` });
            }
            return ins;
        }

        const INSIGHT_STYLE = {
            positive: { bg:'#F0FDF4', border:'#BBF7D0', text:'#166534', icon:'check-circle' },
            warning:  { bg:'#FFFBEB', border:'#FDE68A', text:'#92400E', icon:'alert-triangle' },
            danger:   { bg:'#FFF1F2', border:'#FECDD3', text:'#9F1239', icon:'alert-circle' },
            info:     { bg:'#F0F9FF', border:'#BAE6FD', text:'#075985', icon:'info' },
        };

        // Team Comparison Page
        const TeamComparisonPage = React.memo(function TeamComparisonPage() {
            const dm = useDark();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const [loading, setLoading]         = React.useState(true);
            const [deptMetrics, setDeptMetrics] = React.useState([]);
            const [summary, setSummary]         = React.useState({});
            const [sortBy, setSortBy]           = React.useState('resolved');
            const [sortDir, setSortDir]         = React.useState('desc');
            const [selectedDept, setSelectedDept] = React.useState(null);
            const canvasRef  = React.useRef(null);
            const chartInst  = React.useRef(null);

            React.useEffect(() => {
                (async () => {
                    try {
                        const su = getSessionUser();
                        const uqp = getUserQueryParams(su);
                        const tsp = getTicketScopeParams(su);
                        const tParams = new URLSearchParams({ all:'1', limit:'500' });
                        if (tsp.scope)  tParams.set('scope',  tsp.scope);
                        if (tsp.userId) tParams.set('userId', String(tsp.userId));
                        if (tsp.deptId) tParams.set('deptId', String(tsp.deptId));
                        const [usersRes, ticketsRes] = await Promise.all([
                            fetch(`${HRMS_API}/users?status=active&limit=200${uqp}`),
                            fetch(`${HRMS_API}/tickets?${tParams}`),
                        ]);
                        const allUsers = (usersRes.ok   ? await usersRes.json()   : { users: [] }).users   || [];
                        const tickets  = (ticketsRes.ok ? await ticketsRes.json() : { tickets: [] }).tickets || [];
                        const now = Date.now();

                        // Exclude director-level users and users without a department from team comparison
                        const isDirector = u => Array.isArray(u.positions)
                            ? u.positions.some(p => (p.type||p.position_type||'').toLowerCase() === 'director')
                            : (u.position_type||'').toLowerCase() === 'director';
                        const users = allUsers.filter(u => !isDirector(u) && u.department_name);

                        const userDept = {};
                        users.forEach(u => { userDept[u.id] = u.department_name; });

                        const depts = {};
                        users.forEach(u => {
                            const d = u.department_name;
                            if (!depts[d]) depts[d] = { name: d, staff: [], tickets: [] };
                            depts[d].staff.push(u);
                        });
                        // Tickets assigned to a director or a staff member without a
                        // department can't be attributed to a real department, but they
                        // still represent real work — bucket them under "Other" instead of
                        // silently dropping them, so team totals aren't undercounted.
                        const OTHER_BUCKET = 'Other (no dept / director)';
                        tickets.forEach(t => {
                            if (!t.assigneeId) return;
                            const d = userDept[t.assigneeId] || OTHER_BUCKET;
                            if (!depts[d]) depts[d] = { name: d, staff: [], tickets: [] };
                            depts[d].tickets.push(t);
                        });

                        const metrics = Object.values(depts).map(dept => {
                            const ts       = dept.tickets;
                            const resolved = ts.filter(isResT);
                            const pending  = ts.filter(t => !isResT(t));
                            const withinSla = resolved.filter(t => !t.slaBreached);
                            const sla      = resolved.length ? Math.round((withinSla.length/resolved.length)*100) : null;
                            const resRate  = ts.length ? Math.round((resolved.length/ts.length)*100) : null;
                            const durs     = resolved.filter(t=>t.resolvedAt&&t.createdAt).map(t=>(new Date(t.resolvedAt)-new Date(t.createdAt))/3600000);
                            const avgHours = durs.length ? Math.round(durs.reduce((a,b)=>a+b,0)/durs.length) : null;
                            const escalated    = ts.filter(t=>t.isEscalated).length;
                            const overdue      = pending.filter(t=>t.dueAt&&new Date(t.dueAt)<now).length;
                            const criticalHigh = ts.filter(t=>{const p=(t.priorityLabel||t.priority||'').toLowerCase();return p==='critical'||p==='high';}).length;
                            return { name:dept.name, staff:dept.staff.length, assigned:ts.length, resolved:resolved.length,
                                     pending:pending.length, resRate, sla, avgHours, escalated, overdue, criticalHigh,
                                     staffList: dept.staff, ticketList: ts };
                        }).filter(m => m.staff>0||m.assigned>0);

                        setDeptMetrics(metrics);
                        const hasSla = metrics.filter(m=>m.sla!==null);
                        setSummary({
                            totalDepts:    metrics.length,
                            totalStaff:    users.length,
                            totalAssigned: metrics.reduce((a,b)=>a+b.assigned,0),
                            totalResolved: metrics.reduce((a,b)=>a+b.resolved,0),
                            totalEscalated:metrics.reduce((a,b)=>a+b.escalated,0),
                            avgSla:        hasSla.length ? Math.round(hasSla.reduce((a,b)=>a+b.sla,0)/hasSla.length) : null,
                        });
                    } catch(e) { console.error(e); }
                    finally { setLoading(false); }
                })();
            }, []);

            // Chart — use rAF to ensure canvas has layout dimensions before Chart.js draws
            React.useEffect(() => {
                if (!deptMetrics.length) return;
                let rafId;
                loadChartJs().then(() => {
                rafId = requestAnimationFrame(() => {
                    if (!canvasRef.current) return;
                    if (chartInst.current) { try { chartInst.current.destroy(); } catch(_){} chartInst.current = null; }
                    chartInst.current = new Chart(canvasRef.current, {
                        type: 'bar',
                        data: {
                            labels: deptMetrics.map(d=>d.name),
                            datasets: [
                                { label:'Assigned',  data:deptMetrics.map(d=>d.assigned),  backgroundColor:'rgba(109,39,115,0.8)',  borderRadius:4 },
                                { label:'Resolved',  data:deptMetrics.map(d=>d.resolved),  backgroundColor:'rgba(52,211,153,0.8)',  borderRadius:4 },
                                { label:'Pending',   data:deptMetrics.map(d=>d.pending),   backgroundColor:'rgba(252,211,77,0.8)',  borderRadius:4 },
                                { label:'Escalated', data:deptMetrics.map(d=>d.escalated), backgroundColor:'rgba(249,115,22,0.8)',  borderRadius:4 },
                                { label:'Overdue',   data:deptMetrics.map(d=>d.overdue),   backgroundColor:'rgba(244,63,94,0.8)',   borderRadius:4 },
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins:{ legend:{ position:'bottom', labels:{boxWidth:12,padding:16,font:{size:12}} } },
                            scales:{
                                y:{ beginAtZero:true, grid:{color:'#F3F4F6'}, ticks:{stepSize:1} },
                                x:{ grid:{display:false} }
                            }
                        }
                    });
                });
                }); // end loadChartJs().then
                return () => {
                    cancelAnimationFrame(rafId);
                    if (chartInst.current) { try { chartInst.current.destroy(); } catch(_){} chartInst.current = null; }
                };
            }, [deptMetrics]);

            const sorted = [...deptMetrics].sort((a,b) => {
                const v = sortDir==='asc' ? 1 : -1;
                const av = a[sortBy]??-1, bv = b[sortBy]??-1;
                return (typeof av==='string' ? av.localeCompare(bv) : av-bv)*v;
            });

            const SortTh = ({col, label}) => (
                <th onClick={()=>{setSortBy(col);setSortDir(d=>d==='asc'?'desc':'asc');}}
                    style={{padding:'10px 12px',textAlign:'center',fontSize:'11px',fontWeight:700,color:textM,textTransform:'uppercase',letterSpacing:'0.05em',cursor:'pointer',whiteSpace:'nowrap',userSelect:'none',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                    {label}{sortBy===col?(sortDir==='asc'?' ↑':' ↓'):''}
                </th>
            );

            const top3  = [...deptMetrics].sort((a,b)=>b.resolved-a.resolved).slice(0,3);

            return (
                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Team Comparison</h1>
                        <p className="text-gray-500 text-sm mb-6">Live department-level performance metrics</p>

                        {loading ? (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 24px'}}><SectionLoader message="Loading department metrics…" /></div>
                        ) : (<>

                        {/* Summary cards */}
                        <div className="yc-grid-6 grid gap-4 mb-6" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)"}}>
                            {[
                                { label:'Departments',    value:summary.totalDepts,    icon:'building-2', color:dm?'#C77DB8':'#6D2773' },
                                { label:'Total Staff',    value:summary.totalStaff,    icon:'users', color:'#0EA5E9' },
                                { label:'Total Assigned', value:summary.totalAssigned, icon:'clipboard-list', color:'#833089' },
                                { label:'Total Resolved', value:summary.totalResolved, icon:'check-circle', color:'#10B981' },
                                { label:'Escalated',      value:summary.totalEscalated,icon:'alert-triangle', color:'#F97316' },
                                { label:'Avg SLA',        value:summary.avgSla!=null?`${summary.avgSla}%`:'—', icon:'target', color:'#EC4899' },
                            ].map((c,i) => (
                                <div key={i} style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'16px 18px',boxShadow:'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                                    <div style={{fontSize:'11px',color:textM,fontWeight:600,marginBottom:4}}><Icon name={c.icon} size={11} style={{marginRight:3}} />{c.label}</div>
                                    <div style={{fontSize:'26px',fontWeight:800,color:c.color}}>{c.value??'—'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Podium */}
                        {top3.length>0 && (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'20px 24px',marginBottom:'20px',boxShadow:'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)'}}>
                            <h2 style={{fontSize:'14px',fontWeight:700,color:textP,marginBottom:'16px',display:'flex',alignItems:'center',gap:6}}><Icon name='award' size={14} color={textM} />Top Performing Departments</h2>
                            <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
                                {top3.map((d,i) => {
                                    const rankC = ['#A0824F','#8B8F94','#A0896F'][i];
                                    return (
                                    <div key={d.name} onClick={()=>setSelectedDept(d)} style={{flex:'1 1 200px',borderRadius:'10px',border:`1px solid ${borderC}`,padding:'16px',background:cardBg,cursor:'pointer',transition:'box-shadow 0.15s'}}
                                        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(15,23,42,0.1)'}
                                        onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                                        <div style={{width:26,height:26,borderRadius:'50%',background:rankC,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='award' size={13} color='#fff' /></div>
                                        <div style={{fontWeight:700,fontSize:'14px',color:textP,marginTop:6}}>{d.name}</div>
                                        <div style={{fontSize:'12px',color:textM,marginTop:4}}>
                                            {d.staff} staff · {d.resolved} resolved{d.resRate!=null?` · ${d.resRate}% rate`:''}
                                        </div>
                                        {d.sla!=null && (<>
                                            <div style={{marginTop:8,height:4,borderRadius:4,background:dm?'rgba(109,39,115,0.15)':'#E5E7EB'}}>
                                                <div style={{height:4,borderRadius:4,width:`${d.sla}%`,background:d.sla>=80?'#10B981':d.sla>=60?'#F59E0B':'#EF4444'}}/>
                                            </div>
                                            <div style={{fontSize:'10px',color:dm?'#4a607f':'#94A3B8',marginTop:2}}>{d.sla}% SLA compliance</div>
                                        </>)}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {/* Chart — canvas always mounted so ref is available when deptMetrics loads */}
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'20px 24px',marginBottom:'20px',boxShadow:'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)',display:deptMetrics.length>0?'block':'none'}}>
                            <h2 style={{fontSize:'14px',fontWeight:700,color:textP,marginBottom:'16px',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='bar-chart' size={14} color={dm?'#C77DB8':'#6D2773'} />Department Metrics Comparison</h2>
                            <div className="chart-container"><canvas ref={canvasRef}></canvas></div>
                        </div>

                        {/* Table */}
                        {deptMetrics.length>0 ? (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0 0 0 1px rgba(15,23,42,0.03)',overflow:'hidden'}}>
                            <div style={{padding:'16px 20px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`}}>
                                <h2 style={{fontSize:'14px',fontWeight:700,color:textP,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='clipboard-list' size={14} color={dm?'#C77DB8':'#6D2773'} />Full Department Breakdown</h2>
                                <p style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',marginTop:2}}>Click column headers to sort</p>
                            </div>
                            <div className="yc-table-scroll">
                                <table style={{width:'100%',borderCollapse:'collapse'}}>
                                    <thead>
                                        <tr style={{borderBottom:`2px solid ${borderC}`}}>
                                            <th style={{padding:'10px 12px',textAlign:'left',fontSize:'11px',fontWeight:700,color:textM,textTransform:'uppercase',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF',whiteSpace:'nowrap'}}>Department</th>
                                            <SortTh col="staff"        label="Staff" />
                                            <SortTh col="assigned"     label="Assigned" />
                                            <SortTh col="resolved"     label="Resolved" />
                                            <SortTh col="pending"      label="Pending" />
                                            <SortTh col="resRate"      label="Res. Rate" />
                                            <SortTh col="avgHours"     label="Avg Time" />
                                            <SortTh col="sla"          label="SLA %" />
                                            <SortTh col="escalated"    label="Escalated" />
                                            <SortTh col="overdue"      label="Overdue" />
                                            <SortTh col="criticalHigh" label="Crit/High" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sorted.map((d,i) => (
                                            <tr key={d.name} onClick={()=>setSelectedDept(d)}
                                                style={{borderBottom:`1px solid ${borderC}`,background:i%2===0?(dm?'rgba(255,255,255,0.02)':'white'):(dm?'rgba(109,39,115,0.03)':'#FAFAFA'),cursor:'pointer'}}
                                                onMouseEnter={e=>e.currentTarget.style.background=dm?'rgba(109,39,115,0.08)':'#F0F4FF'}
                                                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?(dm?'rgba(255,255,255,0.02)':'white'):(dm?'rgba(109,39,115,0.03)':'#FAFAFA')}>
                                                <td style={{padding:'11px 12px',fontSize:'13px',fontWeight:600,color:textP,whiteSpace:'nowrap'}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                                                        <div style={{width:30,height:30,borderRadius:'50%',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:dm?'#C77DB8':'#6D2773',flexShrink:0}}>
                                                            {(d.name||'?')[0].toUpperCase()}
                                                        </div>
                                                        {d.name}
                                                    </div>
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center',fontSize:'13px',color:dm?'#c0cfec':'#334155'}}>{d.staff}</td>
                                                <td style={{padding:'11px 12px',textAlign:'center',fontSize:'13px',color:dm?'#c0cfec':'#334155'}}>{d.assigned}</td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    <span style={{fontWeight:700,fontSize:'13px',color:'#10B981'}}>{d.resolved}</span>
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center',fontSize:'13px',color:dm?'#c0cfec':'#334155'}}>{d.pending}</td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {d.resRate!=null
                                                        ? <span style={{fontSize:'12px',fontWeight:700,padding:'2px 8px',borderRadius:20,background:d.resRate>=80?(dm?'rgba(16,185,129,0.15)':'#D1FAE5'):d.resRate>=50?(dm?'rgba(245,158,11,0.15)':'#FEF3C7'):(dm?'rgba(239,68,68,0.15)':'#FEE2E2'),color:d.resRate>=80?(dm?'#6ee7b7':'#065F46'):d.resRate>=50?(dm?'#fcd34d':'#92400E'):(dm?'#fca5a5':'#991B1B')}}>{d.resRate}%</span>
                                                        : <span style={{color:'#D1D5DB'}}>—</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center',fontSize:'12px',color:textM}}>
                                                    {d.avgHours!=null?(d.avgHours>=24?`${Math.round(d.avgHours/24)}d`:`${d.avgHours}h`):'—'}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {d.sla!=null
                                                        ? <span style={{fontSize:'12px',fontWeight:700,padding:'2px 8px',borderRadius:20,background:d.sla>=80?(dm?'rgba(16,185,129,0.15)':'#D1FAE5'):d.sla>=60?(dm?'rgba(245,158,11,0.15)':'#FEF3C7'):(dm?'rgba(239,68,68,0.15)':'#FEE2E2'),color:d.sla>=80?(dm?'#6ee7b7':'#065F46'):d.sla>=60?(dm?'#fcd34d':'#92400E'):(dm?'#fca5a5':'#991B1B')}}>{d.sla}%</span>
                                                        : <span style={{color:'#D1D5DB'}}>—</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {d.escalated>0
                                                        ? <span style={{background:dm?'rgba(239,68,68,0.15)':'#FEF2F2',color:dm?'#fca5a5':'#DC2626',fontWeight:700,padding:'2px 8px',borderRadius:6,fontSize:'12px'}}>{d.escalated}</span>
                                                        : <span style={{color:'#D1D5DB'}}>0</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {d.overdue>0
                                                        ? <span style={{background:dm?'rgba(249,115,22,0.15)':'#FFF7ED',color:dm?'#fdba74':'#EA580C',fontWeight:700,padding:'2px 8px',borderRadius:6,fontSize:'12px'}}>{d.overdue}</span>
                                                        : <span style={{color:'#D1D5DB'}}>0</span>}
                                                </td>
                                                <td style={{padding:'11px 12px',textAlign:'center'}}>
                                                    {d.criticalHigh>0
                                                        ? <span style={{background:dm?'rgba(190,18,60,0.15)':'#FFF1F2',color:dm?'#fda4af':'#BE123C',fontWeight:700,padding:'2px 8px',borderRadius:6,fontSize:'12px'}}>{d.criticalHigh}</span>
                                                        : <span style={{color:'#D1D5DB'}}>0</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ) : (
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,padding:'48px',textAlign:'center'}}>
                            <div style={{marginBottom:'12px',display:'flex',justifyContent:'center'}}><Icon name='inbox' size={36} color={dm?'#4a607f':'#94A3B8'} /></div>
                            <p style={{color:dm?'#4a607f':'#94A3B8',fontSize:'14px'}}>No department data yet — seed tickets and assign them to staff to see metrics.</p>
                        </div>
                        )}
                        </>)}

                        {/* ── Insight Drawer ── */}
                        {selectedDept && (() => {
                            const d = selectedDept;
                            const insights = genDeptInsights(d);
                            // Staff breakdown from ticketList
                            const staffMap = {};
                            (d.ticketList||[]).forEach(tk => {
                                const sid = tk.assigneeId || tk.assigned_to;
                                const sname = tk.assigneeName || tk.assignee_name || ('User #'+sid);
                                if (!sid) return;
                                if (!staffMap[sid]) staffMap[sid] = {name:sname,assigned:0,resolved:0,pending:0};
                                staffMap[sid].assigned++;
                                if (isResT(tk)) staffMap[sid].resolved++;
                                if (tk.status==='pending_approval') staffMap[sid].pending++;
                            });
                            const staffRows = Object.values(staffMap).sort((a,b)=>b.assigned-a.assigned);
                            // Category breakdown
                            const catMap = {};
                            (d.ticketList||[]).forEach(tk => {
                                const cl = tk.categoryLabel || tk.category_label || 'Uncategorised';
                                catMap[cl] = (catMap[cl]||0)+1;
                            });
                            // Status breakdown
                            const stMap = {};
                            (d.ticketList||[]).forEach(tk => {
                                const s = (tk.status||'unknown').toLowerCase();
                                stMap[s] = (stMap[s]||0)+1;
                            });
                            const ST_LABEL = {new:'New',assigned:'Assigned',in_progress:'In Progress',waiting:'Waiting',pending_approval:'Pending Approval',resolved:'Resolved',closed:'Closed'};
                            const ST_COLOR = {new:dm?'#6b80a4':'#64748B',assigned:'#3B82F6',in_progress:'#F59E0B',waiting:'#833089',pending_approval:'#EC4899',resolved:'#10B981',closed:dm?'#6b80a4':'#475569'};
                            return (
                                <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex'}}>
                                    {/* overlay */}
                                    <div style={{flex:1,background:'rgba(0,0,0,0.35)',cursor:'pointer'}} onClick={()=>setSelectedDept(null)}/>
                                    {/* panel */}
                                    <div style={{width:'420px',maxWidth:'95vw',background:cardBg,overflowY:'auto',boxShadow:dm?'-4px 0 40px rgba(0,0,0,0.7),- 1px 0 rgba(109,39,115,0.15)':'-4px 0 24px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column'}}>
                                        {/* header */}
                                        <div style={{padding:'20px 24px',borderBottom:`1px solid ${dm?'rgba(109,39,115,0.08)':'#EEF2F8'}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:dm?'rgba(8,16,36,0.98)':'#fff',zIndex:1}}>
                                            <div>
                                                <div style={{fontSize:'18px',fontWeight:700,color:textP}}>{d.name}</div>
                                                <div style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',marginTop:'2px'}}>{d.staff} staff · {d.assigned} tickets</div>
                                            </div>
                                            <button onClick={()=>setSelectedDept(null)} style={{background:'none',border:'none',cursor:'pointer',color:dm?'#4a607f':'#94A3B8',padding:'4px 8px',display:'flex',alignItems:'center'}}><Icon name='x' size={18} color={dm?'#4a607f':'#94A3B8'} /></button>
                                        </div>
                                        <div style={{padding:'20px 24px',flex:1}}>
                                            {/* metric chips */}
                                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'24px'}}>
                                                {[
                                                    {label:'Assigned', value:d.assigned, color:'#3B82F6'},
                                                    {label:'Resolved', value:d.resolved, color:'#10B981'},
                                                    {label:'Pending', value:d.pending,   color:'#EC4899'},
                                                    {label:'SLA %',    value:d.sla!=null?d.sla+'%':'—', color: d.sla==null?'#9CA3AF':d.sla>=80?'#10B981':d.sla>=60?'#F59E0B':'#EF4444'},
                                                    {label:'Avg Hours',value:d.avgHours!=null?d.avgHours:'—', color:'#833089'},
                                                    {label:'Escalated',value:d.escalated,color:'#EF4444'},
                                                ].map(m=>(
                                                    <div key={m.label} style={{background:dm?'rgba(4,8,20,0.6)':'#F8FAFF',borderRadius:'8px',padding:'10px 12px',textAlign:'center'}}>
                                                        <div style={{fontSize:'18px',fontWeight:700,color:m.color}}>{m.value}</div>
                                                        <div style={{fontSize:'11px',color:textM,marginTop:'2px'}}>{m.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* insights */}
                                            {insights.length > 0 && (
                                                <div style={{marginBottom:'24px'}}>
                                                    <div style={{fontSize:'13px',fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Insights</div>
                                                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                                        {insights.map((ins,i)=>{
                                                            const st = INSIGHT_STYLE[ins.type]||INSIGHT_STYLE.info;
                                                            return (
                                                                <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start',background:st.bg,borderRadius:'8px',padding:'10px 12px',border:`1px solid ${st.border}`}}>
                                                                    <Icon name={st.icon} size={16} style={{flexShrink:0}} />
                                                                    <span style={{fontSize:'13px',color:st.text,lineHeight:'1.4'}}>{ins.msg}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Staff breakdown */}
                                            {staffRows.length > 0 && (
                                                <div style={{marginBottom:'24px'}}>
                                                    <div style={{fontSize:'13px',fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Staff Breakdown</div>
                                                    <div style={{borderRadius:'8px',border:`1px solid ${borderC}`,overflow:'hidden'}}>
                                                        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                                                            <thead>
                                                                <tr style={{background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                                                                    <th style={{padding:'8px 12px',textAlign:'left',color:textM,fontWeight:600}}>Name</th>
                                                                    <th style={{padding:'8px 8px',textAlign:'center',color:textM,fontWeight:600}}>Asgd</th>
                                                                    <th style={{padding:'8px 8px',textAlign:'center',color:textM,fontWeight:600}}>Res</th>
                                                                    <th style={{padding:'8px 8px',textAlign:'center',color:textM,fontWeight:600}}>Pend</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {staffRows.map((sr,i)=>(
                                                                    <tr key={i} style={{borderTop:`1px solid ${borderC}`}}>
                                                                        <td style={{padding:'8px 12px',color:textP,maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sr.name}</td>
                                                                        <td style={{padding:'8px',textAlign:'center',color:'#3B82F6',fontWeight:600}}>{sr.assigned}</td>
                                                                        <td style={{padding:'8px',textAlign:'center',color:'#10B981',fontWeight:600}}>{sr.resolved}</td>
                                                                        <td style={{padding:'8px',textAlign:'center',color:'#EC4899',fontWeight:600}}>{sr.pending}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Category breakdown */}
                                            {Object.keys(catMap).length > 0 && (
                                                <div style={{marginBottom:'24px'}}>
                                                    <div style={{fontSize:'13px',fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>By Category</div>
                                                    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                                                        {Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([cat,cnt])=>{
                                                            const pct = d.assigned ? Math.round(cnt/d.assigned*100) : 0;
                                                            return (
                                                                <div key={cat}>
                                                                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:dm?'#c0cfec':'#334155',marginBottom:'3px'}}>
                                                                        <span>{cat}</span><span style={{fontWeight:600}}>{cnt}</span>
                                                                    </div>
                                                                    <div style={{height:'6px',background:dm?'rgba(109,39,115,0.12)':'#F0F0F0',borderRadius:'3px'}}>
                                                                        <div style={{height:'100%',width:pct+'%',background:'#833089',borderRadius:'3px'}}/>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status breakdown */}
                                            {Object.keys(stMap).length > 0 && (
                                                <div>
                                                    <div style={{fontSize:'13px',fontWeight:600,color:dm?'#c0cfec':'#334155',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>By Status</div>
                                                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                                                        {Object.entries(stMap).sort((a,b)=>b[1]-a[1]).map(([st,cnt])=>(
                                                            <div key={st} style={{display:'flex',alignItems:'center',gap:'5px',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF',border:`1px solid ${borderC}`,borderRadius:'20px',padding:'4px 10px',fontSize:'12px'}}>
                                                                <span style={{width:'8px',height:'8px',borderRadius:'50%',background:ST_COLOR[st]||'#9CA3AF',display:'inline-block',flexShrink:0}}/>
                                                                <span style={{color:dm?'#c0cfec':'#334155'}}>{ST_LABEL[st]||st}</span>
                                                                <span style={{fontWeight:700,color:textP}}>{cnt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </main>
            );
        });

        // Analytics Page
        const AnalyticsPage = React.memo(function AnalyticsPage() {

            const dm = useDark();
            const cache = useTicketCache();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const [tickets, setTickets] = React.useState(() => cache.tickets);
            const [loading, setLoading] = React.useState(() => !cache.ready);
            const [range, setRange] = React.useState('90'); // days

            const charts = React.useRef({});

            React.useEffect(() => {
                if (cache.ready) { setLoading(false); return; }
                API.tickets.getAll({ all: true, limit: 500 }).then(d => {
                    setTickets(d.tickets || []);
                    setLoading(false);
                }).catch(() => { setLoading(false); });
            }, []);

            // Derived metrics (memoized — only recalc when tickets or range changes)
            const analytics = React.useMemo(() => {
                const now = new Date();
                const cutoff = new Date(now); cutoff.setDate(now.getDate() - Number(range));
                const filtered = tickets.filter(t => new Date(t.createdAt || t.date || now) >= cutoff);

                let open=0, resolved=0, escalated=0, ndis=0, slaBreached=0, overduePct=0;
                const resTickets = [];
                const priorityCounts = { critical:0, urgent:0, high:0, medium:0, low:0 };
                const statusCounts = {};
                const catCounts = {};
                const staffCounts = {};

                for (const t of filtered) {
                    const s = (t.status||t.status_id||'open').toLowerCase();
                    const isRes = ['resolved','closed'].includes(s);
                    if (isRes) { resolved++; resTickets.push(t); } else open++;
                    if (t.isEscalated) escalated++;
                    if (t.ndisRelated||t.ndis_related||t.ndisrelated) ndis++;
                    if (!isRes && t.dueAt && new Date(t.dueAt) < now) overduePct++;
                    const p = (t.priorityLabel||t.priority||t.priority_id||'Low').toLowerCase();
                    if (priorityCounts[p]!==undefined) priorityCounts[p]++;
                    else if (p.includes('critical')||p.includes('urgent')) priorityCounts['critical']++;
                    statusCounts[s] = (statusCounts[s]||0)+1;
                    const c = t.categoryLabel||t.category||t.category_id||'Other';
                    catCounts[c] = (catCounts[c]||0)+1;
                    const a = t.assigneeName||t.assignedToName||'Unassigned';
                    staffCounts[a] = (staffCounts[a]||0)+1;
                }
                for (const t of resTickets) { if (t.slaBreached||t.sla_breached) slaBreached++; }
                const slaOkCount = resTickets.length - slaBreached;
                const slaEval    = resTickets.length + overduePct;
                const slaRate    = slaEval > 0 ? Math.round((slaOkCount / slaEval) * 100) : 100;
                const total      = filtered.length;
                const resRate    = total ? Math.round((resolved/total)*100) : 0;
                const topCats    = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,7);
                const staffRows  = Object.entries(staffCounts).sort((a,b)=>b[1]-a[1]);

                // Monthly volume (last 6 months)
                const monthlyMap = {};
                for(let i=5;i>=0;i--){ const d=new Date(now); d.setMonth(d.getMonth()-i); const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; monthlyMap[k]=0; }
                for (const t of filtered) { const d=new Date(t.createdAt||t.date||now); const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if(monthlyMap[k]!==undefined) monthlyMap[k]++; }
                const monthLabels = Object.keys(monthlyMap).map(k=>{ const [y,m]=k.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]+' '+y; });
                const monthData   = Object.values(monthlyMap);

                return { now, filtered, total, open, resolved, escalated, ndis, slaRate, resRate, slaBreached, slaOkCount, overduePct, slaEval, resTickets, priorityCounts, statusCounts, catCounts, staffCounts, topCats, staffRows, monthLabels, monthData };
            }, [tickets, range]);

            const { now, filtered, total, open, resolved, escalated, ndis, slaRate, resRate, slaBreached, slaOkCount, overduePct, slaEval, resTickets, priorityCounts, statusCounts, catCounts, staffCounts, topCats, staffRows, monthLabels, monthData } = analytics;

            // Build / rebuild charts after render
            React.useEffect(() => {
                if(loading) return;
                loadChartJs().then(() => {
                const destroy = id => { if(charts.current[id]) { charts.current[id].destroy(); delete charts.current[id]; } };
                const COLORS = { critical:'#EF4444', urgent:'#EF4444', high:'#F97316', medium:'#EAB308', low:'#833089' };
                const PALETTE = ['#833089','#833089','#EC4899','#F97316','#EAB308','#10B981','#06B6D4'];

                // 1. Monthly trend line
                destroy('trend');
                const tc = document.getElementById('chart-trend');
                if(tc) charts.current.trend = new Chart(tc, { type:'line', data:{ labels:monthLabels, datasets:[{ label:'Tickets Created', data:monthData, borderColor:'#833089', backgroundColor:'rgba(109,39,115,0.08)', fill:true, tension:0.4, pointBackgroundColor:'#833089', pointRadius:4 }] }, options:{ responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, grid:{color:dm?'rgba(109,39,115,0.08)':'#F3F4F6'}, ticks:{stepSize:1,color:dm?'#4a607f':'#94A3B8'} }, x:{ grid:{display:false}, ticks:{color:dm?'#4a607f':'#94A3B8'} } } } });

                // 2. Priority doughnut
                destroy('priority');
                const pc = document.getElementById('chart-priority');
                const pLabels = Object.keys(priorityCounts).filter(k=>priorityCounts[k]>0);
                const pData   = pLabels.map(k=>priorityCounts[k]);
                const pColors = pLabels.map(k=>COLORS[k]||'#833089');
                if(pc) charts.current.priority = new Chart(pc, { type:'doughnut', data:{ labels:pLabels.map(l=>l.charAt(0).toUpperCase()+l.slice(1)), datasets:[{ data:pData, backgroundColor:pColors, borderWidth:2, borderColor:'white', hoverOffset:6 }] }, options:{ responsive:true, cutout:'68%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, padding:12, font:{size:11}, color:dm?'#8fa4cc':'#334155' } } } } });

                // 3. Category bar
                destroy('category');
                const cc = document.getElementById('chart-category');
                if(cc) charts.current.category = new Chart(cc, { type:'bar', data:{ labels:topCats.map(([k])=>k.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())), datasets:[{ label:'Tickets', data:topCats.map(([,v])=>v), backgroundColor:PALETTE, borderRadius:6, borderSkipped:false }] }, options:{ indexAxis:'y', responsive:true, plugins:{ legend:{display:false} }, scales:{ x:{ beginAtZero:true, grid:{color:dm?'rgba(109,39,115,0.08)':'#F3F4F6'}, ticks:{stepSize:1,color:dm?'#4a607f':'#94A3B8'} }, y:{ grid:{display:false}, ticks:{color:dm?'#8fa4cc':'#334155'} } } } });

                // 4. Status breakdown bar
                destroy('status');
                const sc = document.getElementById('chart-status');
                const sLabels = Object.keys(statusCounts);
                const statusColors = { open:'#833089', in_progress:'#F97316', resolved:'#10B981', closed:'#833089', pending_approval:'#EAB308', new:'#06B6D4', waiting:'#EC4899', assigned:'#3B82F6' };
                if(sc) charts.current.status = new Chart(sc, { type:'bar', data:{ labels:sLabels.map(l=>l.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())), datasets:[{ label:'Count', data:sLabels.map(k=>statusCounts[k]), backgroundColor:sLabels.map(k=>statusColors[k]||'#833089'), borderRadius:8, borderSkipped:false }] }, options:{ responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, grid:{color:dm?'rgba(109,39,115,0.08)':'#F3F4F6'}, ticks:{color:dm?'#4a607f':'#94A3B8'} }, x:{ grid:{display:false}, ticks:{color:dm?'#8fa4cc':'#334155'} } } } });

                // 5. Staff workload bar
                destroy('staff');
                const stc = document.getElementById('chart-staff');
                if(stc) charts.current.staff = new Chart(stc, { type:'bar', data:{ labels:staffRows.map(([k])=>k), datasets:[{ label:'Assigned', data:staffRows.map(([,v])=>v), backgroundColor:'rgba(109,39,115,0.75)', borderRadius:6, borderSkipped:false }] }, options:{ indexAxis:'y', responsive:true, plugins:{ legend:{display:false} }, scales:{ x:{ beginAtZero:true, grid:{color:dm?'rgba(109,39,115,0.08)':'#F3F4F6'}, ticks:{color:dm?'#4a607f':'#94A3B8'} }, y:{ grid:{display:false}, ticks:{color:dm?'#8fa4cc':'#334155'} } } } });

                // 6. NDIS vs Non-NDIS pie
                destroy('ndis');
                const nc = document.getElementById('chart-ndis');
                if(nc) charts.current.ndis = new Chart(nc, { type:'doughnut', data:{ labels:['NDIS Related','Non-NDIS'], datasets:[{ data:[ndis, total-ndis], backgroundColor:['#833089','#EAD6E6'], borderWidth:2, borderColor:'white', hoverOffset:4 }] }, options:{ responsive:true, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, padding:10, font:{size:11}, color:dm?'#8fa4cc':'#334155' } } } } });
                }); // end loadChartJs().then

            }, [loading, range, filtered.map(t=>t.id||t.createdAt).join(',')]);

            const [insight, setInsight] = React.useState(null);

            const buildAnalyticsInsight = (type) => {
                const now2 = new Date();
                const getStatus   = t => (t.status||t.status_id||'');
                const getCategory = t => (t.categoryLabel||t.category||t.category_id||'Other');
                const getAssignee = t => (t.assigneeName||t.assignedToName||'Unassigned');
                const getPriority = t => (t.priorityLabel||t.priority||t.priority_id||'Low');
                const isRes = t => ['resolved','closed'].includes(getStatus(t));
                const fmtAge = t => { const d=Math.floor((now2-new Date(t.createdAt||t.date||now2))/86400000); return d===0?'Today':d===1?'Yesterday':`${d}d ago`; };
                const pBadge = p => { const l=p.toLowerCase(); return l==='critical'||l==='urgent'?{bg:dm?'rgba(239,68,68,0.15)':'#FEF2F2',color:dm?'#fca5a5':'#DC2626'}:l==='high'?{bg:dm?'rgba(249,115,22,0.15)':'#FFF7ED',color:dm?'#fdba74':'#EA580C'}:l==='medium'?{bg:dm?'rgba(234,179,8,0.15)':'#FEFCE8',color:dm?'#fcd34d':'#A16207'}:{bg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:dm?'#C77DB8':'#5D2162'}; };
                const tkRow = t => { const p=getPriority(t); const pb=pBadge(p); return {title:t.title||t.subtitle||t.title_type||'Untitled',sub:`${getAssignee(t)} · ${getCategory(t)} · ${fmtAge(t)}`,badge:p,badgeBg:pb.bg,badgeColor:pb.color}; };

                if (type==='total') {
                    const catMap={};filtered.forEach(t=>{const c=getCategory(t);catMap[c]=(catMap[c]||0)+1;});
                    const topCat=Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
                    const openPct=total?Math.round((open/total)*100):0;
                    return { title:`All Tickets — Last ${range} Days`, subtitle:`${total} tickets created in this period`, icon:'ticket', iconBg:dm?'rgba(30,27,75,0.4)':'#F6ECF4',
                        metrics:[{label:'Total',value:total,color:dm?'#C77DB8':'#6D2773'},{label:'Open',value:open,color:'#F97316'},{label:'Resolved',value:resolved,color:'#10B981'}],
                        insights:[
                            {type:resRate>=70?'good':'warn',icon:resRate>=70?'check-circle':'alert-triangle',title:`${resRate}% Resolution Rate`,text:`${resolved} of ${total} tickets in this period have been resolved. ${resRate>=70?'Strong throughput — team is keeping up with demand.':resRate>=50?'Moderate resolution rate — consider if there are workflow or capacity constraints.':'Lower resolution rate warrants investigation into potential bottlenecks or resourcing gaps.'}`},
                            {type:openPct>50?'bad':openPct>25?'warn':'good',icon:openPct>50?'alert-circle':'alert-triangle',title:'Open Backlog Risk',text:`${open} tickets (${openPct}%) remain open in this period. ${openPct>50?'Backlog is accumulating — review capacity allocation.':openPct>25?'Moderate open load.':'Healthy pipeline balance.'}`},
                            topCat?{type:'info',icon:'map-pin',title:'Leading Category',text:`"${topCat[0].replace(/_/g,' ')}" is the top category with ${topCat[1]} tickets (${Math.round((topCat[1]/total)*100)}% of this period). Resource allocation and process quality here directly impacts overall performance.`}:null,
                            escalated>0?{type:'warn',icon:'arrow-up-circle',title:`${escalated} Escalation${escalated!==1?'s':''}`,text:`${escalated} ticket${escalated!==1?'s were':' was'} escalated in this period. Investigate recurring categories to address root causes before they escalate.`}:{type:'good',icon:'sparkles',title:'Zero Escalations',text:'No escalations in this period — indicates strong service delivery and proactive resolution.'},
                        ].filter(Boolean),
                        breakdown:Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([label,value])=>({label,value,bar:Math.round((value/total)*100),sub:`${Math.round((value/total)*100)}%`})),
                        breakdownTitle:'Volume by Category',
                    };
                }
                if (type==='open') {
                    const openTkts=filtered.filter(t=>!isRes(t)).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
                    const byA={};openTkts.forEach(t=>{const a=getAssignee(t);byA[a]=(byA[a]||0)+1;});
                    const unassigned=openTkts.filter(t=>!t.assigneeName&&!t.assignedToName).length;
                    return { title:'Open Tickets', subtitle:`${open} unresolved tickets in period`, icon:'lock-open', iconBg:dm?'rgba(249,115,22,0.12)':'#FFF7ED',
                        metrics:[{label:'Open',value:open,color:'#F97316'},{label:'% of Period',value:`${total?Math.round((open/total)*100):0}%`,color:'#EF4444'},{label:'Unassigned',value:unassigned,color:'#DC2626'}],
                        insights:[
                            unassigned>0?{type:'bad',icon:'alert-octagon',title:`${unassigned} Without Assignee`,text:`${unassigned} open ticket${unassigned!==1?'s have':' has'} no assigned staff member. These are at highest risk of being missed — assign immediately.`}:{type:'good',icon:'check-circle',title:'All Open Tickets Assigned',text:'All open tickets have assigned staff — good ownership and accountability.'},
                            overduePct>0?{type:'bad',icon:'clock',title:`${overduePct} Actively Overdue`,text:`${overduePct} open ticket${overduePct!==1?'s are':' is'} past their due date. Each one is an active SLA breach. Prioritise resolution today.`}:null,
                            Object.keys(byA).length>0?{type:'info',icon:'users',title:'Open Load by Staff',text:`Open tickets distributed across ${Object.keys(byA).length} staff member${Object.keys(byA).length!==1?'s':''}. ${Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,c])=>`${n}: ${c}`).join(' · ')}.`}:null,
                        ].filter(Boolean),
                        rows:openTkts.map(tkRow), rowsTitle:'Open Tickets (oldest first)',
                    };
                }
                if (type==='resolved') {
                    const resTkts2=filtered.filter(isRes);
                    const byA={};resTkts2.forEach(t=>{const a=getAssignee(t);byA[a]=(byA[a]||0)+1;});
                    const topRes=Object.entries(byA).sort((a,b)=>b[1]-a[1])[0];
                    return { title:'Resolved Tickets', subtitle:`${resolved} tickets closed in this period`, icon:'check-circle', iconBg:dm?'rgba(16,185,129,0.12)':'#ECFDF5',
                        metrics:[{label:'Resolved',value:resolved,color:'#10B981'},{label:'Resolution Rate',value:`${resRate}%`,color:'#10B981'},{label:'SLA Met',value:`${slaRate}%`,color:slaRate>=80?'#10B981':'#F59E0B'}],
                        insights:[
                            {type:resRate>=70?'good':'warn',icon:'bar-chart-2',title:`${resRate}% Period Resolution Rate`,text:`${resRate>=70?'Excellent resolution velocity — the team is effectively closing out demand.':resRate>=50?'Moderate resolution rate. Consider whether complex tickets are causing delays.':'Lower resolution rate — investigate workflow friction, capacity constraints, or external dependencies.'}`},
                            {type:slaRate>=80?'good':'warn',icon:'clock',title:`SLA Compliance: ${slaRate}%`,text:`${slaOkCount} of ${slaEval} evaluated tickets met SLA. ${slaBreached>0?`${slaBreached} resolved late.`:''} ${overduePct>0?`${overduePct} still open and overdue.`:''}`},
                            topRes?{type:'good',icon:'award',title:'Top Resolver This Period',text:`${topRes[0]} resolved the most tickets (${topRes[1]}) in this period. High individual performers should be recognised and their practices shared with the team.`}:null,
                        ].filter(Boolean),
                        breakdown:Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([label,value])=>({label,value,bar:resTkts2.length?Math.round((value/resTkts2.length)*100):0,sub:`${resTkts2.length?Math.round((value/resTkts2.length)*100):0}%`})),
                        breakdownTitle:'Resolved by Staff',
                    };
                }
                if (type==='sla') {
                    const potSla=Math.round((slaOkCount+overduePct)/Math.max(slaEval,1)*100);
                    return { title:'SLA Compliance', subtitle:`Service level analysis · last ${range} days`, icon:'clock', iconBg:dm?'rgba(16,185,129,0.12)':'#ECFDF5',
                        metrics:[{label:'SLA Rate',value:`${slaRate}%`,color:slaRate>=80?'#10B981':slaRate>=60?'#F59E0B':'#EF4444'},{label:'On Time',value:slaOkCount,color:'#10B981'},{label:'Breached',value:slaBreached+overduePct,color:'#EF4444'}],
                        insights:[
                            {type:slaRate>=90?'good':slaRate>=70?'warn':'bad',icon:slaRate>=90?'check-circle':slaRate>=70?'alert-triangle':'alert-octagon',title:`SLA at ${slaRate}% in This Period`,text:slaRate>=90?'Outstanding SLA performance — the team is consistently meeting client commitments.':slaRate>=70?'SLA compliance is acceptable but improvable. Focus on reducing overdue tickets first.':'SLA compliance needs immediate attention. Review ticket assignment, staff capacity, and escalation processes.'},
                            overduePct>0?{type:'bad',icon:'clock',title:`${overduePct} Active Overdue`,text:`${overduePct} tickets are currently open past their due date. Resolving these would push SLA from ${slaRate}% to ~${potSla}%.`}:{type:'good',icon:'target',title:'No Active Overdue',text:'All active tickets are within their due dates this period.'},
                            slaBreached>0?{type:'warn',icon:'clipboard-list',title:`${slaBreached} Late Closures`,text:`${slaBreached} ticket${slaBreached!==1?'s were':' was'} resolved after their due date. Analyse these for common causes — repeated patterns indicate a process or capacity issue.`}:null,
                            {type:'info',icon:'info',title:'Calculation',text:`SLA = ${slaOkCount} on-time ÷ (${resTickets.length} resolved + ${overduePct} overdue) = ${slaRate}%.`},
                        ].filter(Boolean),
                        breakdown:[{label:'On Time',value:slaOkCount,dot:'#10B981',bar:slaEval?Math.round((slaOkCount/slaEval)*100):0,sub:'on time'},{label:'Resolved Late',value:slaBreached,dot:'#F97316',bar:slaEval?Math.round((slaBreached/slaEval)*100):0,sub:'late'},{label:'Active Overdue',value:overduePct,dot:'#EF4444',bar:slaEval?Math.round((overduePct/slaEval)*100):0,sub:'overdue'}],
                        breakdownTitle:'SLA Components',
                    };
                }
                if (type==='escalated') {
                    const escTkts=filtered.filter(t=>t.isEscalated);
                    const byCat={};escTkts.forEach(t=>{const c=getCategory(t);byCat[c]=(byCat[c]||0)+1;});
                    return { title:'Escalated Tickets', subtitle:`${escalated} escalations in last ${range} days`, icon:'arrow-up-circle', iconBg:dm?'rgba(109,39,115,0.12)':'#F5F3FF',
                        metrics:[{label:'Escalated',value:escalated,color:'#6D2773'},{label:'% of Period',value:`${total?Math.round((escalated/total)*100):0}%`,color:'#833089'},{label:'Still Open',value:escTkts.filter(t=>!isRes(t)).length,color:'#EF4444'}],
                        insights:[
                            escalated===0?{type:'good',icon:'sparkles',title:'Zero Escalations This Period',text:`No tickets were escalated in the last ${range} days — reflects effective first-contact resolution and well-managed expectations.`}:{type:'warn',icon:'alert-triangle',title:'Escalation Categories',text:`Escalations in this period: ${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,n])=>`${c.replace(/_/g,' ')} (${n})`).join(', ')}. Investigate root causes to build prevention strategies.`},
                            escalated>0&&escTkts.filter(t=>!isRes(t)).length>0?{type:'bad',icon:'alert-octagon',title:'Open Escalations',text:`${escTkts.filter(t=>!isRes(t)).length} escalated ticket${escTkts.filter(t=>!isRes(t)).length!==1?'s remain':' remains'} open — these represent the highest risk to client trust and SLA compliance.`}:null,
                        ].filter(Boolean),
                        rows:escTkts.map(tkRow), rowsTitle:'Escalated Tickets',
                    };
                }
                if (type==='ndis') {
                    const ndisTkts=filtered.filter(t=>t.ndisRelated||t.ndis_related||t.ndisrelated);
                    const nonNdis=total-ndis;
                    const ndisRes=ndisTkts.filter(isRes).length;
                    const ndisResRate=ndisTkts.length>0?Math.round((ndisRes/ndisTkts.length)*100):0;
                    const byCat={};ndisTkts.forEach(t=>{const c=getCategory(t);byCat[c]=(byCat[c]||0)+1;});
                    return { title:'NDIS Related Tickets', subtitle:`NDIS compliance analysis · last ${range} days`, icon:'heart-handshake', iconBg:dm?'rgba(6,182,212,0.12)':'#ECFEFF',
                        metrics:[{label:'NDIS Tickets',value:ndis,color:'#06B6D4'},{label:'% of Total',value:`${total?Math.round((ndis/total)*100):0}%`,color:'#0EA5E9'},{label:'NDIS Resolved',value:ndisRes,color:'#10B981'}],
                        insights:[
                            {type:'info',icon:'clipboard-list',title:'NDIS Compliance Obligation',text:`${ndis} NDIS-related ticket${ndis!==1?'s':''} in this period (${total?Math.round((ndis/total)*100):0}% of total). Ensure all NDIS tickets have complete documentation, appropriate response times, and comply with NDIS Practice Standards.`},
                            {type:ndisResRate>=70?'good':'warn',icon:ndisResRate>=70?'check-circle':'alert-triangle',title:`NDIS Resolution Rate: ${ndisResRate}%`,text:`${ndisRes} of ${ndisTkts.length} NDIS tickets have been resolved. ${ndisResRate>=70?'Strong compliance throughput.':'Review NDIS ticket workflows — lower resolution rates may indicate complexity or resourcing gaps in NDIS service delivery.'}`},
                            Object.keys(byCat).length>0?{type:'info',icon:'map-pin',title:'NDIS Category Distribution',text:`NDIS tickets span: ${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,n])=>`${c.replace(/_/g,' ')} (${n})`).join(', ')}. Ensure service staff in these areas are trained in NDIS compliance requirements.`}:null,
                        ].filter(Boolean),
                        breakdown:Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label:label.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),value,bar:ndis?Math.round((value/ndis)*100):0,sub:`${ndis?Math.round((value/ndis)*100):0}%`})),
                        breakdownTitle:'NDIS Tickets by Category',
                    };
                }
                if (type==='trend') {
                    const maxMonth=Math.max(...monthData,1); const minMonth=Math.min(...monthData.filter(v=>v>0),0);
                    const recentTrend=monthData.slice(-3); const prevTrend=monthData.slice(-6,-3);
                    const recentAvg=recentTrend.reduce((a,b)=>a+b,0)/Math.max(recentTrend.length,1);
                    const prevAvg=prevTrend.reduce((a,b)=>a+b,0)/Math.max(prevTrend.length,1);
                    const trendDir=recentAvg>prevAvg*1.1?'up':recentAvg<prevAvg*0.9?'down':'stable';
                    return { title:'Ticket Volume Trend', subtitle:'Monthly ticket creation over 6 months', icon:'trending-up', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Peak Month',value:maxMonth,color:'#EF4444'},{label:'Monthly Avg',value:Math.round(monthData.reduce((a,b)=>a+b,0)/Math.max(monthData.length,1)),color:dm?'#C77DB8':'#6D2773'},{label:'Recent Avg',value:Math.round(recentAvg),color:'#10B981'}],
                        insights:[
                            {type:trendDir==='up'?'warn':trendDir==='down'?'good':'info',icon:trendDir==='up'?'trending-up':trendDir==='down'?'activity':'chevron-right',title:`Volume Trend: ${trendDir==='up'?'Increasing':trendDir==='down'?'Decreasing':'Stable'}`,text:`Recent 3-month average (${Math.round(recentAvg)}/mo) vs prior 3-month (${Math.round(prevAvg)}/mo). ${trendDir==='up'?'Increasing volume may require capacity review to prevent SLA degradation.':trendDir==='down'?'Decreasing volume may indicate improved client self-service, seasonal variation, or reduced service demand.':'Volume is stable — predictable demand enables effective resource planning.'}`},
                            {type:'info',icon:'bar-chart-2',title:'Volume Distribution',text:`Peak month: ${monthLabels[monthData.indexOf(maxMonth)]} (${maxMonth} tickets). ${maxMonth>recentAvg*1.5?'Significant volume spikes suggest seasonal patterns or one-off events — investigate and plan for recurrence.':'Volume is relatively consistent across months — good for planning.'}`},
                        ],
                        breakdown:monthLabels.map((label,i)=>({label,value:monthData[i],bar:maxMonth?Math.round((monthData[i]/maxMonth)*100):0})),
                        breakdownTitle:'Monthly Volume',
                    };
                }
                if (type==='priority') {
                    const pMap=Object.entries(priorityCounts).filter(([,v])=>v>0);
                    const critUrgCount=(priorityCounts.critical||0)+(priorityCounts.urgent||0);
                    return { title:'Priority Distribution', subtitle:`Ticket priority breakdown · last ${range} days`, icon:'target', iconBg:dm?'rgba(239,68,68,0.08)':'#FFF5F5',
                        metrics:[{label:'Critical/Urgent',value:critUrgCount,color:'#EF4444'},{label:'High',value:priorityCounts.high||0,color:'#F97316'},{label:'Med/Low',value:(priorityCounts.medium||0)+(priorityCounts.low||0),color:'#833089'}],
                        insights:[
                            {type:critUrgCount/Math.max(total,1)>0.2?'bad':critUrgCount>0?'warn':'good',icon:critUrgCount/Math.max(total,1)>0.2?'alert-octagon':critUrgCount>0?'alert-triangle':'check-circle',title:'Critical Load Assessment',text:`${critUrgCount} critical/urgent ticket${critUrgCount!==1?'s':''} represent ${total?Math.round((critUrgCount/total)*100):0}% of the period's volume. ${critUrgCount/Math.max(total,1)>0.2?'High critical ratio may indicate service quality issues or insufficient preventative maintenance — investigate root causes.':critUrgCount>0?'Manageable critical load — monitor for any upward trend.':'No critical tickets — excellent risk management.'}`},
                            {type:'info',icon:'bar-chart-2',title:'Priority Balance',text:`Priority mix: ${pMap.map(([p,c])=>`${p}: ${c} (${Math.round((c/total)*100)}%)`).join(', ')}. A healthy service operation typically sees most tickets in the medium/low range.`},
                        ],
                        breakdown:[{label:'Critical/Urgent',value:critUrgCount,dot:'#EF4444',bar:total?Math.round((critUrgCount/total)*100):0},{label:'High',value:priorityCounts.high||0,dot:'#F97316',bar:total?Math.round(((priorityCounts.high||0)/total)*100):0},{label:'Medium',value:priorityCounts.medium||0,dot:'#EAB308',bar:total?Math.round(((priorityCounts.medium||0)/total)*100):0},{label:'Low',value:priorityCounts.low||0,dot:'#833089',bar:total?Math.round(((priorityCounts.low||0)/total)*100):0}],
                        breakdownTitle:'Priority Breakdown',
                    };
                }
                if (type==='status') {
                    const SC2={new:'#06B6D4',assigned:'#3B82F6',in_progress:'#F59E0B',waiting:'#833089',pending_approval:'#EC4899',resolved:'#10B981',closed:'#475569'};
                    return { title:'Status Breakdown', subtitle:`All ticket statuses · last ${range} days`, icon:'clipboard-list', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Active Pipeline',value:open,color:'#F59E0B'},{label:'Resolved',value:resolved,color:'#10B981'},{label:'Waiting/Blocked',value:(statusCounts['waiting']||0)+(statusCounts['pending_approval']||0),color:'#833089'}],
                        insights:[
                            {type:'info',icon:'trending-up',title:'Pipeline Flow',text:`${open} tickets in the open queue, ${Object.values(statusCounts).reduce((a,b)=>a+b,0)-resolved} actively being managed. A healthy pipeline has more tickets in "in_progress" than "new" or "assigned".`},
                            (statusCounts['waiting']||0)>0?{type:'warn',icon:'pause-circle',title:`${statusCounts['waiting']} Blocked Tickets`,text:`${statusCounts['waiting']} ticket${statusCounts['waiting']!==1?'s are':' is'} in "Waiting" — stalled on external input. Follow up to unblock and protect SLA.`}:null,
                            (statusCounts['pending_approval']||0)>0?{type:'warn',icon:'clipboard-list',title:`${statusCounts['pending_approval']} Awaiting Approval`,text:`${statusCounts['pending_approval']} ticket${statusCounts['pending_approval']!==1?'s require':' requires'} approval. Approvers should be prompted to review to prevent delays.`}:null,
                        ].filter(Boolean),
                        breakdown:Object.entries(statusCounts).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label:label.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),value,dot:SC2[label]||'#833089',bar:Math.round((value/Math.max(total,1))*100),sub:`${Math.round((value/Math.max(total,1))*100)}%`})),
                        breakdownTitle:'Status Breakdown',
                    };
                }
                if (type==='category') {
                    const openByCat={};filtered.filter(t=>!isRes(t)).forEach(t=>{const c=getCategory(t);openByCat[c]=(openByCat[c]||0)+1;});
                    const top=topCats[0];
                    return { title:'Top Categories', subtitle:`Service category analysis · last ${range} days`, icon:'folder', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Categories',value:topCats.length,color:dm?'#C77DB8':'#6D2773'},{label:'Top Volume',value:top?top[1]:0,color:'#F97316'},{label:'Open in Top',value:top?openByCat[top[0]]||0:0,color:'#EF4444'}],
                        insights:[
                            top?{type:'info',icon:'map-pin',title:`"${top[0].replace(/_/g,' ')}" Leads Volume`,text:`Top category with ${top[1]} tickets (${Math.round((top[1]/total)*100)}% of period). ${openByCat[top[0]]>0?`${openByCat[top[0]]} remain open.`:''} Ensure staff capacity, process documentation, and quality standards are prioritised here.`}:null,
                            {type:'info',icon:'layers',title:'Category Spread',text:topCats.slice(0,2).reduce((s,[,v])=>s+v,0)/total>0.7?`Top 2 categories account for ${Math.round(topCats.slice(0,2).reduce((s,[,v])=>s+v,0)/total*100)}% of tickets — high concentration. Investigate if this reflects a systemic issue.`:`Tickets are spread across ${topCats.length} categories — broad service delivery with no extreme concentration.`},
                        ].filter(Boolean),
                        breakdown:topCats.map(([label,value])=>({label:label.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),value,bar:Math.round((value/total)*100),sub:`${openByCat[label]||0} open`})),
                        breakdownTitle:'Volume by Category',
                    };
                }
                if (type==='staff') {
                    const top3Staff=staffRows.slice(0,3);
                    const unassigned=filtered.filter(t=>!t.assigneeName&&!t.assignedToName).length;
                    const maxLoad=staffRows[0]?staffRows[0][1]:0;
                    const avgLoad=staffRows.length>0?Math.round(staffRows.reduce((s,[,v])=>s+v,0)/staffRows.length):0;
                    return { title:'Staff Workload', subtitle:`Team capacity analysis · last ${range} days`, icon:'users', iconBg:dm?'rgba(109,39,115,0.15)':'#F6ECF4',
                        metrics:[{label:'Active Staff',value:staffRows.length,color:dm?'#C77DB8':'#6D2773'},{label:'Avg Load',value:avgLoad,color:'#F59E0B'},{label:'Unassigned',value:unassigned,color:'#EF4444'}],
                        insights:[
                            maxLoad>avgLoad*2?{type:'warn',icon:'alert-triangle',title:'Uneven Workload Distribution',text:`${staffRows[0]?staffRows[0][0]:'Top staff'} has ${maxLoad} tickets vs team average of ${avgLoad}. Significant imbalances risk burnout and SLA inconsistencies — consider redistributing open tickets.`}:{type:'good',icon:'layers',title:'Balanced Team Load',text:`Workload is relatively evenly distributed across ${staffRows.length} staff (avg ${avgLoad} tickets each). Balanced loads support consistent service quality.`},
                            unassigned>0?{type:'bad',icon:'alert-octagon',title:`${unassigned} Unassigned Tickets`,text:`${unassigned} ticket${unassigned!==1?'s have':' has'} no assigned staff. These are invisible to all team members and at risk of being missed entirely — assign immediately.`}:{type:'good',icon:'check-circle',title:'Full Ticket Coverage',text:'All tickets have an assigned staff member — complete ownership and accountability across the team.'},
                            top3Staff.length>0?{type:'info',icon:'award',title:'Top Performers',text:`Highest load: ${top3Staff.map(([n,c])=>`${n} (${c})`).join(', ')}. Top performers should be recognised — their approaches may provide best practice learnings for the team.`}:null,
                        ].filter(Boolean),
                        breakdown:staffRows.slice(0,10).map(([label,value])=>({label,value,bar:maxLoad?Math.round((value/maxLoad)*100):0,sub:`${value} tickets`})),
                        breakdownTitle:'Tickets per Staff Member',
                    };
                }
                if (type==='ndis-chart') {
                    return buildAnalyticsInsight('ndis');
                }
                return null;
            };

            const card = (label, value, sub, color='#833089', icon, meta, onClickFn) => (
                <div onClick={onClickFn} style={{background:cardBg, borderRadius:'16px', border:`1.5px solid ${borderC}`, padding:'18px 20px', boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 6px rgba(109,39,115,0.07)', cursor:onClickFn?'pointer':'default', transition:'transform 0.12s'}}
                    onMouseEnter={e=>{if(onClickFn)e.currentTarget.style.transform='translateY(-2px)'}}
                    onMouseLeave={e=>e.currentTarget.style.transform=''}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px'}}>
                        <p style={{fontSize:'11px', fontWeight:'700', color:dm?'#4a607f':'#94A3B8', textTransform:'uppercase', letterSpacing:'0.07em', margin:0}}>{label}</p>
                        <Icon name={icon} size={20} />
                    </div>
                    <p style={{fontSize:'30px', fontWeight:'700', color, margin:'0 0 4px', lineHeight:1}}>{value}</p>
                    <p style={{fontSize:'12px', color:dm?'#4a607f':'#94A3B8', margin:'0 0 4px'}}>{sub}</p>
                    {onClickFn && <p style={{fontSize:'9px',color:dm?'rgba(109,39,115,0.5)':'rgba(109,39,115,0.4)',margin:0,fontWeight:'600',letterSpacing:'0.06em'}}>CLICK FOR INSIGHTS →</p>}
                </div>
            );

            const chartCard = (title, subtitle, id, height=220, footnote, onClickFn) => (
                <div onClick={onClickFn} style={{background:cardBg, borderRadius:'16px', border:`1.5px solid ${borderC}`, padding:'20px', boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 6px rgba(109,39,115,0.07)', cursor:onClickFn?'pointer':'default', transition:'transform 0.12s'}}
                    onMouseEnter={e=>{if(onClickFn)e.currentTarget.style.transform='translateY(-2px)'}}
                    onMouseLeave={e=>e.currentTarget.style.transform=''}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'2px'}}>
                        <p style={{fontSize:'14px', fontWeight:'700', color:dm?'#E3BFDA':'#1E1B4B', margin:0}}>{title}</p>
                        {onClickFn && <span style={{fontSize:'9px',color:dm?'rgba(109,39,115,0.5)':'rgba(109,39,115,0.4)',fontWeight:'700',letterSpacing:'0.06em',flexShrink:0,marginLeft:'8px',marginTop:'2px'}}>CLICK FOR INSIGHTS</span>}
                    </div>
                    <p style={{fontSize:'11px', color:dm?'#4a607f':'#94A3B8', margin:'0 0 10px'}}>{subtitle}</p>
                    <div style={{position:'relative', height:`${height}px`}}>
                        <canvas id={id}></canvas>
                    </div>
                </div>
            );

            return (<>
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    <div style={{maxWidth:'1400px', margin:'0 auto', padding:'24px 28px'}}>

                        {/* Header */}
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px'}}>
                            <div>
                                <h1 style={{fontSize:'22px', fontWeight:'700', color:dm?'#E3BFDA':'#1E1B4B', margin:0, display:'flex', alignItems:'center', gap:'8px'}}><Icon name='bar-chart' size={20} color={dm?'#C77DB8':'#6D2773'} />Analytics</h1>
                                <p style={{fontSize:'12px', color:dm?'#4a607f':'#94A3B8', margin:'4px 0 0'}}>Business insights · {tickets.length} tickets loaded · as of {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', background:cardBg, border:`1.5px solid ${borderC}`, borderRadius:'10px', padding:'8px 14px'}}>
                                <span style={{fontSize:'11px', fontWeight:'700', color:dm?'#C77DB8':'#6D2773', textTransform:'uppercase', letterSpacing:'0.06em'}}>Period</span>
                                <select value={range} onChange={e=>setRange(e.target.value)} style={{border:`1px solid ${borderC}`, borderRadius:'6px', padding:'4px 8px', fontSize:'12px', fontWeight:'600', color:dm?'#C77DB8':'#5D2162', background:dm?'rgba(109,39,115,0.15)':'#F5F3FF', cursor:'pointer', outline:'none'}}>
                                    <option value="30">Last 30 days</option>
                                    <option value="60">Last 60 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="180">Last 6 months</option>
                                    <option value="365">Last 12 months</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{textAlign:'center', padding:'60px', color:dm?'#4a607f':'#94A3B8'}}>
                                <SectionLoader message="Loading analytics…" size={40} />
                            </div>
                        ) : (<>

                        {/* ── KPI Cards ── */}
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px', marginBottom:'20px'}}>
                            {card('Total Tickets', total, `in last ${range} days`, '#1E1B4B', 'ticket', null, ()=>!loading&&setInsight(buildAnalyticsInsight('total')))}
                            {card('Open', open, `${total ? Math.round((open/total)*100) : 0}% of total`, '#F97316', 'lock-open', null, ()=>!loading&&setInsight(buildAnalyticsInsight('open')))}
                            {card('Resolved', resolved, `${resRate}% resolution rate`, '#10B981', 'check-circle', null, ()=>!loading&&setInsight(buildAnalyticsInsight('resolved')))}
                            {card('SLA Compliance', `${slaRate}%`, `${slaBreached} late closures · ${overduePct} active overdue`, slaRate>=90?'#10B981':slaRate>=70?'#F97316':'#EF4444', 'clock', null, ()=>!loading&&setInsight(buildAnalyticsInsight('sla')))}
                            {card('Escalated', escalated, `${total ? Math.round((escalated/total)*100) : 0}% of total`, '#833089', 'arrow-up-circle', null, ()=>!loading&&setInsight(buildAnalyticsInsight('escalated')))}
                            {card('NDIS Related', ndis, `${total ? Math.round((ndis/total)*100) : 0}% of total`, '#06B6D4', 'heart-handshake', null, ()=>!loading&&setInsight(buildAnalyticsInsight('ndis')))}
                        </div>

                        {/* ── Row 1: Trend + Priority ── */}
                        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px', marginBottom:'16px'}}>
                            {chartCard('Ticket Volume Trend', 'Monthly ticket creation — all tickets regardless of period filter', 'chart-trend', 200, null, ()=>!loading&&setInsight(buildAnalyticsInsight('trend')))}
                            {chartCard('Priority Breakdown', `Distribution by priority · ${filtered.length} tickets in period`, 'chart-priority', 200, null, ()=>!loading&&setInsight(buildAnalyticsInsight('priority')))}
                        </div>

                        {/* ── Row 2: Status + Category ── */}
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                            {chartCard('Tickets by Status', `Raw status values from backend · ${filtered.length} tickets`, 'chart-status', 200, null, ()=>!loading&&setInsight(buildAnalyticsInsight('status')))}
                            {chartCard('Top Categories', `Top ${Math.min(topCats.length,7)} categories by volume · ${filtered.length} tickets`, 'chart-category', 200, null, ()=>!loading&&setInsight(buildAnalyticsInsight('category')))}
                        </div>

                        {/* ── Row 3: Staff + NDIS + Insights ── */}
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                            {chartCard('Staff Workload', `Assigned tickets per staff member · ${filtered.length} tickets`, 'chart-staff', 200, null, ()=>!loading&&setInsight(buildAnalyticsInsight('staff')))}
                            {chartCard('NDIS vs Non-NDIS', `NDIS flag from backend · ${ndis} of ${total} tickets flagged`, 'chart-ndis', 200, null, ()=>!loading&&setInsight(buildAnalyticsInsight('ndis-chart')))}

                            {/* Key Insights card */}
                            <div style={{background:cardBg, borderRadius:'16px', border:`1.5px solid ${borderC}`, padding:'20px', boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 6px rgba(109,39,115,0.07)'}}>
                                <p style={{fontSize:'14px', fontWeight:'700', color:dm?'#E3BFDA':'#1E1B4B', margin:'0 0 2px', display:'flex', alignItems:'center', gap:'6px'}}><Icon name='sparkles' size={14} color={dm?'#C77DB8':'#6D2773'} />Key Insights</p>
                                <p style={{fontSize:'11px', color:dm?'#4a607f':'#94A3B8', margin:'0 0 14px'}}>Auto-generated observations</p>
                                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                                    {[
                                        { icon:'check-circle', text: resRate >= 80 ? `Strong resolution rate of ${resRate}% — team is performing well.` : `Resolution rate is ${resRate}% — consider reviewing workload distribution.`, good: resRate >= 80 },
                                        { icon: slaRate >= 90 ? 'check-circle' : 'alert-circle', text: `SLA compliance: ${slaRate}% (${slaOkCount} on-time / ${slaEval} evaluated). ${slaBreached} closed late; ${overduePct} still open & overdue.`, good: slaRate >= 90 },
                                        { icon: escalated > 0 ? 'alert-triangle' : 'check-circle', text: escalated > 0 ? `${escalated} ticket${escalated!==1?'s':''} escalated — review underlying causes to prevent recurrence.` : 'No escalations in this period — excellent.', good: escalated === 0 },
                                        { icon:'info', text: `${ndis} NDIS-related ticket${ndis!==1?'s':''} (${total ? Math.round((ndis/total)*100) : 0}%) — ensure compliance documentation is up to date.`, good: true },
                                        { icon: topCats[0] ? 'map-pin' : 'map-pin', text: topCats[0] ? `Highest volume category: "${topCats[0][0].replace(/_/g,' ')}" with ${topCats[0][1]} ticket${topCats[0][1]!==1?'s':''}.` : 'No category data available.', good: true },
                                        { icon: open > resolved ? 'alert-circle' : 'check-circle', text: open > resolved ? `More open (${open}) than resolved (${resolved}) tickets — backlog may be building.` : `More resolved (${resolved}) than open (${open}) — healthy pipeline.`, good: open <= resolved },
                                    ].map((ins,i) => (
                                        <div key={i} style={{display:'flex', gap:'8px', alignItems:'flex-start', padding:'8px 10px', borderRadius:'8px', background: ins.good ? '#F0FDF4' : '#FFF7ED', border:`1px solid ${ins.good ? '#BBF7D0' : '#FED7AA'}`}}>
                                            <Icon name={ins.icon} size={13} style={{flexShrink:0}} />
                                            <p style={{fontSize:'11px', color:dm?'#c0cfec':'#334155', margin:0, lineHeight:'1.5'}}>{ins.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Summary table: Priority × Status ── */}
                        <div style={{background:cardBg, borderRadius:'16px', border:`1.5px solid ${borderC}`, padding:'20px', boxShadow:dm?'0 4px 24px rgba(0,0,0,0.4)':'0 1px 6px rgba(109,39,115,0.07)', marginBottom:'16px'}}>
                            <p style={{fontSize:'14px', fontWeight:'700', color:dm?'#E3BFDA':'#1E1B4B', margin:'0 0 2px', display:'flex', alignItems:'center', gap:'6px'}}><Icon name='clipboard-list' size={14} color={dm?'#C77DB8':'#6D2773'} />Ticket Summary Table</p>
                            <p style={{fontSize:'11px', color:dm?'#4a607f':'#94A3B8', margin:'0 0 14px'}}>Breakdown by category, priority and status</p>
                            <div className="yc-table-scroll">
                                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'12px'}}>
                                    <thead>
                                        <tr style={{borderBottom:`2px solid ${borderC}`, background:dm?'rgba(109,39,115,0.12)':'#F8F7FF'}}>
                                            {['Category','Total','Critical','High','Medium','Low','Open','Resolved','SLA OK'].map(h=>(
                                                <th key={h} style={{padding:'8px 12px', textAlign: h==='Category'?'left':'center', fontWeight:'700', color:dm?'#C77DB8':'#6D2773', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap'}}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,cnt],i)=>{
                                            const catTkts = filtered.filter(t=>(t.categoryLabel||t.category||t.category_id||'Other')===cat);
                                            const critH = catTkts.filter(t=>['critical','urgent'].includes((t.priorityLabel||t.priority||t.priority_id||'').toLowerCase())).length;
                                            const high   = catTkts.filter(t=>(t.priorityLabel||t.priority||t.priority_id||'').toLowerCase()==='high').length;
                                            const med    = catTkts.filter(t=>(t.priorityLabel||t.priority||t.priority_id||'').toLowerCase()==='medium').length;
                                            const low    = catTkts.filter(t=>(t.priorityLabel||t.priority||t.priority_id||'').toLowerCase()==='low').length;
                                            const catOpen= catTkts.filter(t=>!['resolved','closed'].includes((t.status||t.status_id||'').toLowerCase())).length;
                                            const catRes = catTkts.filter(t=>['resolved','closed'].includes((t.status||t.status_id||'').toLowerCase())).length;
                                            const catSla = catTkts.filter(t=>!(t.slaBreached||t.sla_breached)).length;
                                            return (
                                                <tr key={cat} style={{borderBottom:'1px solid #F6ECF4', background: i%2===0 ? (dm?'rgba(255,255,255,0.02)':'white') : (dm?'rgba(109,39,115,0.04)':'#FAFBFF')}}>
                                                    <td style={{padding:'9px 12px', fontWeight:'600', color:dm?'#c0cfec':'#334155', textTransform:'capitalize'}}>{cat.replace(/_/g,' ')}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center', fontWeight:'700', color:dm?'#E3BFDA':'#1E1B4B'}}>{cnt}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center'}}>{critH>0?<span style={{background:'#FEF2F2',color:'#DC2626',padding:'2px 7px',borderRadius:'20px',fontWeight:'700',fontSize:'11px'}}>{critH}</span>:<span style={{color:'#D1D5DB'}}>—</span>}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center'}}>{high>0?<span style={{background:'#FFF7ED',color:'#C2410C',padding:'2px 7px',borderRadius:'20px',fontWeight:'700',fontSize:'11px'}}>{high}</span>:<span style={{color:'#D1D5DB'}}>—</span>}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center'}}>{med>0?<span style={{background:'#FEFCE8',color:'#A16207',padding:'2px 7px',borderRadius:'20px',fontWeight:'700',fontSize:'11px'}}>{med}</span>:<span style={{color:'#D1D5DB'}}>—</span>}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center'}}>{low>0?<span style={{background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:'#5D2162',padding:'2px 7px',borderRadius:'20px',fontWeight:'700',fontSize:'11px'}}>{low}</span>:<span style={{color:'#D1D5DB'}}>—</span>}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center', color:'#F97316', fontWeight:'600'}}>{catOpen}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center', color:'#10B981', fontWeight:'600'}}>{catRes}</td>
                                                    <td style={{padding:'9px 12px', textAlign:'center'}}><span style={{fontSize:'11px', fontWeight:'700', color: catSla===cnt?'#10B981':'#F97316'}}>{cnt>0?Math.round((catSla/cnt)*100)+'%':'—'}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        </>)}
                    </div>
                </main>
                <InsightDrawer data={insight} onClose={()=>setInsight(null)}/>
            </>);
        });

        // Org Chart Page
        // ── Org Chart helpers (defined outside to keep stable references) ──
        const ORG_GAP  = 10;   // gap between sibling sub-trees (px)
        const ORG_LH   = 16;   // connector line height (px)

        function orgInitials(name) {
            if (!name) return '?';
            const parts = String(name).trim().split(/\s+/).filter(Boolean);
            if (!parts.length) return '?';
            return (parts[0][0] + (parts.length > 1 ? parts[parts.length-1][0] : '')).toUpperCase();
        }

        function orgCountDescendants(node) {
            return (node.children || []).reduce((sum, c) => sum + 1 + orgCountDescendants(c), 0);
        }

        // Brand-themed palette: director/ops/finance map directly to Yahwehcare's
        // three official brand colors (purple #6D2773, blue #0A6ABD, green #82C342);
        // strategic/staff/external reuse lighter tints of those same three hues so
        // every org-chart category still reads as "on brand" rather than introducing
        // unrelated colors.
        const ORG_TYPE_META = {
            director:  { light:'#6D2773', dark:'#A073A4', label:'Director Level' },
            ops:       { light:'#0A6ABD', dark:'#609ED4', label:'Operations (Managers / Officers)' },
            finance:   { light:'#5B892E', dark:'#94B277', label:'Finance (Managers / Officers)' },
            strategic: { light:'#874E8C', dark:'#B18CB4', label:'Strategic Development (Managers / Officers)' },
            staff:     { light:'#3685C9', dark:'#7CB0DC', label:'Team / Staff' },
            external:  { light:'#99CE64', dark:'#BDDF9A', label:'Consultant / External' },
        };

        function OrgCard({ name, title, email, type, vacant, deptLabel, extra, onClick, highlighted, dimmed, hasChildren, collapsed, onToggleCollapse, hiddenCount }) {
            const dm = useDark();
            const meta   = ORG_TYPE_META[type] || ORG_TYPE_META.ops;
            const accent = dm ? meta.dark : meta.light;
            const w = deptLabel ? 190 : 168;
            // dept_label is free-text data (set via Manage Positions), e.g.
            // "Operations DEPARTMENT" or just "Director". First word is the
            // header title, remaining words (if any) are a small caption below
            // it. There's no icon here — an earlier version tried to render the
            // first word inside a small round "icon" chip, which just overflowed
            // the chip and left a stray highlighted-circle artifact behind the
            // text. Now it's plain title + optional caption, no circle.
            const dlParts    = deptLabel ? deptLabel.split(' ') : [];
            const dlTitle    = dlParts[0] || '';
            const dlSubtitle = dlParts.slice(1).join(' ').toUpperCase();
            const initials = orgInitials(name);
            return (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', opacity: dimmed ? 0.32 : 1, transition:'opacity 0.2s ease' }}>
                    <div
                        onClick={onClick}
                        className="org-card"
                        style={{
                            position:'relative',
                            border: `1.5px ${vacant ? 'dashed' : 'solid'} ${vacant ? (dm?'rgba(148,163,184,0.4)':'#D1D5DB') : (dm?`${accent}66`:`${accent}38`)}`,
                            background: dm ? 'linear-gradient(160deg,rgba(20,32,60,0.97) 0%,rgba(10,18,38,0.99) 100%)' : '#FFFFFF',
                            borderRadius: 16,
                            width: w,
                            textAlign: 'center',
                            boxShadow: highlighted
                                ? `0 0 0 3px ${accent}55, 0 10px 22px rgba(0,0,0,0.14)`
                                : (dm ? '0 4px 14px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,23,42,0.07)'),
                            flexShrink: 0,
                            overflow: 'visible',
                            cursor: onClick ? 'pointer' : 'default',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {deptLabel && (
                            <div style={{ background:accent, borderRadius:'14.5px 14.5px 0 0', padding:'10px 8px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                                <p style={{ fontSize:13, fontWeight:800, color:'white', margin:0, lineHeight:1.3 }}>{dlTitle}</p>
                                {dlSubtitle && <p style={{ fontSize:9, fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.07em', margin:0, lineHeight:1.3 }}>{dlSubtitle}</p>}
                            </div>
                        )}
                        <div style={{ padding: deptLabel ? '12px 12px 13px' : '14px 12px 13px' }}>
                            <div style={{
                                width:40, height:40, borderRadius:'50%', margin:'0 auto 8px',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                background: vacant ? (dm?'rgba(148,163,184,0.1)':'#F1F5F9') : accent,
                                border: vacant ? `1.5px dashed ${dm?'rgba(148,163,184,0.4)':'#CBD5E1'}` : 'none',
                                color: vacant ? (dm?'#64748B':'#94A3B8') : 'white',
                                fontSize: vacant ? 15 : 13, fontWeight:800,
                            }}>
                                {vacant ? '—' : initials}
                            </div>
                            <p style={{ fontSize:13, fontWeight:800, color: vacant ? (dm?'#64748B':'#94A3B8') : (dm?'#f0f4ff':'#0F172A'), margin:'0 0 3px', lineHeight:1.3 }}>{name}</p>
                            {title && !vacant && <p style={{ fontSize:10.5, fontWeight:600, color:accent, margin:'0 0 4px', lineHeight:1.35 }}>{title}</p>}
                            {email && !vacant && <p style={{ fontSize:10, color:dm?'#7d93bd':'#64748B', margin:'0 0 8px', wordBreak:'break-word', lineHeight:1.3 }}>{email}</p>}
                            {(!email || vacant) && <div style={{ height:6 }} />}
                            <span style={{
                                display:'inline-flex', alignItems:'center', gap:4, fontSize:9.5, fontWeight:700,
                                color: vacant ? '#DC2626' : '#15803D',
                                background: vacant ? (dm?'rgba(239,68,68,0.12)':'#FEF2F2') : (dm?'rgba(16,185,129,0.14)':'#ECFDF5'),
                                padding:'2px 9px', borderRadius:20,
                                border:`1px solid ${vacant ? (dm?'rgba(239,68,68,0.3)':'#FECACA') : (dm?'rgba(16,185,129,0.3)':'#A7F3D0')}`,
                            }}>
                                <span style={{ width:5, height:5, borderRadius:'50%', background: vacant?'#EF4444':'#10B981' }} />
                                {vacant ? 'Vacant' : 'Active'}
                            </span>
                            {extra && <p style={{ fontSize:9.5, color:dm?'#C77DB8':'#6D2773', margin:'6px 0 0', fontWeight:700 }}>{extra}</p>}
                        </div>
                        {hasChildren && (
                            <button
                                onClick={e => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
                                title={collapsed ? 'Expand branch' : 'Collapse branch'}
                                style={{
                                    position:'absolute', bottom:-11, left:'50%', transform:'translateX(-50%)',
                                    width:22, height:22, borderRadius:'50%',
                                    background: dm ? '#1e293b' : 'white',
                                    border:`1.5px solid ${dm?'rgba(109,39,115,0.45)':'#E3BFDA'}`,
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.18)', zIndex:2, padding:0,
                                }}
                            >
                                <Icon name={collapsed ? 'chevron-right' : 'chevron-down'} size={12} color={dm?'#DDA8D1':'#6D2773'} />
                            </button>
                        )}
                    </div>
                    {collapsed && hiddenCount > 0 && (
                        <div style={{ marginTop:15, fontSize:9.5, fontWeight:700, color:dm?'#C77DB8':'#833089', whiteSpace:'nowrap' }}>+{hiddenCount} hidden</div>
                    )}
                </div>
            );
        }

        // gap  = px between sibling sub-trees (overrides ORG_GAP)
        // lineH = connector vertical height in px (overrides ORG_LH)
        function OrgTree({ card, ch=[], gap=ORG_GAP, lineH=ORG_LH }) {
            const dm = useDark();
            const G = gap, L = dm ? 'rgba(199,125,184,0.4)' : 'rgba(109,39,115,0.3)', LH = lineH;
            const n = ch.length;
            return (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    {card}
                    {n > 0 && <>
                        <div style={{ width:2, height:LH, background:L, flexShrink:0 }} />
                        {n === 1
                            ? ch[0]
                            : <div style={{ display:'flex', gap:`${G}px`, alignItems:'flex-start' }}>
                                {ch.map((c,i) => {
                                    const first=i===0, last=i===n-1;
                                    return (
                                        <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', paddingTop:LH }}>
                                            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:2, height:LH, background:L }} />
                                            {!first && <div style={{ position:'absolute', top:0, left:`${-G/2}px`, right:'50%', height:2, background:L }} />}
                                            {!last  && <div style={{ position:'absolute', top:0, left:'50%', right:`${-G/2}px`, height:2, background:L }} />}
                                            {c}
                                        </div>
                                    );
                                })}
                              </div>
                        }
                    </>}
                </div>
            );
        }

        function OrgDetailModal({ node, type, vacant, name, title, email, deptLabel, onClose }) {
            const dm = useDark();
            const meta   = ORG_TYPE_META[type] || ORG_TYPE_META.ops;
            const accent = dm ? meta.dark : meta.light;
            const staffArr = node.staff || [];
            const reportsCount = (node.children || []).length;
            if (!node) return null;
            return (
                <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', backdropFilter:'blur(3px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
                    <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:420, background: dm ? 'linear-gradient(160deg,rgba(20,32,60,0.99) 0%,rgba(10,18,38,1) 100%)' : 'white', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.35)', overflow:'hidden', border: dm ? '1px solid rgba(109,39,115,0.25)' : 'none' }}>
                        <div style={{ background:accent, padding:'22px 22px 18px', color:'white', position:'relative' }}>
                            <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                                <Icon name='x' size={14} color='white' />
                            </button>
                            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, flexShrink:0 }}>
                                    {vacant ? '—' : orgInitials(name)}
                                </div>
                                <div style={{ minWidth:0 }}>
                                    <p style={{ margin:0, fontSize:17, fontWeight:800, lineHeight:1.3 }}>{name}</p>
                                    {title && !vacant && <p style={{ margin:'2px 0 0', fontSize:12.5, opacity:0.92 }}>{title}</p>}
                                </div>
                            </div>
                        </div>
                        <div style={{ padding:'18px 22px 22px' }}>
                            {(() => {
                                // Only show a caption line when dept_label has more than
                                // one word (e.g. "Operations DEPARTMENT" -> "DEPARTMENT").
                                // Single-word labels like "Director" have no caption part
                                // and would otherwise just duplicate the title shown above.
                                const parts = deptLabel ? deptLabel.split(' ') : [];
                                const caption = parts.length > 1 ? parts.slice(1).join(' ') : '';
                                return caption && <p style={{ fontSize:11, fontWeight:700, color:dm?'#C77DB8':'#6D2773', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 14px' }}>{caption}</p>;
                            })()}
                            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Icon name='shield' size={13} color={dm?'#7d93bd':'#94A3B8'} />
                                    <span style={{ fontSize:12.5, color:dm?'#c0cfec':'#334155', fontWeight:600 }}>{meta.label}</span>
                                </div>
                                {email && !vacant && (
                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                        <Icon name='mail' size={13} color={dm?'#7d93bd':'#94A3B8'} />
                                        <a href={`mailto:${email}`} style={{ fontSize:12.5, color:'#2563EB', fontWeight:600, textDecoration:'none', wordBreak:'break-all' }}>{email}</a>
                                    </div>
                                )}
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Icon name='users' size={13} color={dm?'#7d93bd':'#94A3B8'} />
                                    <span style={{ fontSize:12.5, color:dm?'#c0cfec':'#334155', fontWeight:600 }}>{reportsCount} direct report{reportsCount===1?'':'s'}</span>
                                </div>
                                {staffArr.length > 1 && (
                                    <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                                        <Icon name='user-check' size={13} color={dm?'#7d93bd':'#94A3B8'} />
                                        <span style={{ fontSize:12.5, color:dm?'#c0cfec':'#334155', fontWeight:600 }}>Also assigned: {staffArr.slice(1).map(s=>s.name).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                            <span style={{
                                display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700,
                                color: vacant ? '#DC2626' : '#15803D',
                                background: vacant ? (dm?'rgba(239,68,68,0.12)':'#FEF2F2') : (dm?'rgba(16,185,129,0.14)':'#ECFDF5'),
                                padding:'4px 12px', borderRadius:20,
                                border:`1px solid ${vacant ? (dm?'rgba(239,68,68,0.3)':'#FECACA') : (dm?'rgba(16,185,129,0.3)':'#A7F3D0')}`,
                            }}>
                                <span style={{ width:6, height:6, borderRadius:'50%', background: vacant?'#EF4444':'#10B981' }} />
                                {vacant ? 'Vacant Position' : 'Active Position'}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        const OrgChartPage = React.memo(function OrgChartPage() {

            const dm = useDark();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const [orgData, setOrgData] = React.useState(null);
            const [loading, setLoading] = React.useState(true);
            const [error,   setError]   = React.useState('');
            const [fitScale, setFitScale] = React.useState(1);
            const [zoomPct, setZoomPct] = React.useState(null); // null = auto-fit
            const [naturalSize, setNaturalSize] = React.useState({ w:0, h:0 });
            const [search, setSearch] = React.useState('');
            const [collapsedIds, setCollapsedIds] = React.useState(() => new Set());
            const [selectedNode, setSelectedNode] = React.useState(null);
            const chartWrapRef  = React.useRef(null);
            const containerRef  = React.useRef(null);
            const nodeRefs      = React.useRef({});

            const effScale = zoomPct != null ? zoomPct / 100 : fitScale;

            // Measure natural (unscaled) chart size and compute the auto-fit scale
            const calcScale = React.useCallback(() => {
                const wrap = chartWrapRef.current;
                const cont = containerRef.current;
                if (!wrap || !cont) return;
                const naturalW = wrap.scrollWidth;
                const naturalH = wrap.scrollHeight;
                setNaturalSize({ w: naturalW, h: naturalH });
                const contW = cont.clientWidth - 16;
                setFitScale(naturalW > contW ? Math.max(contW / naturalW, 0.25) : 1);
            }, []);

            React.useEffect(() => {
                if (!orgData) return;
                const t = setTimeout(calcScale, 150);
                return () => clearTimeout(t);
            }, [orgData, calcScale, collapsedIds]);

            const fetchOrg = React.useCallback(async () => {
                setLoading(true);
                setError('');
                try {
                    const res = await fetch(`${HRMS_API}/org/chart`);
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(`API returned ${res.status}${err.message ? ': ' + err.message : ''}`);
                    }
                    const data = await res.json();
                    setOrgData(data);
                } catch(e) {
                    setError('Could not load org chart from API (' + e.message + ').');
                } finally { setLoading(false); }
            }, []);

            React.useEffect(() => { fetchOrg(); }, [fetchOrg]);

            // Flatten tree for stats
            const flatNodes = (node) => [node, ...(node.children||[]).flatMap(flatNodes)];
            const allNodes    = (orgData?.tree || []).flatMap(flatNodes);
            const activeCount = allNodes.filter(n => !n.is_vacant).length;
            const vacantCount = allNodes.filter(n =>  n.is_vacant).length;
            const deptCount   = (orgData?.departments || []).length;
            const sysRoles    = orgData?.bootstrapAdmins || [];

            // Derive position type from title when position_type not yet in response
            const deriveType = (node) => {
                if (node.position_type) return node.position_type;
                const t = (node.title || '').toLowerCase();
                if (t.includes('director')) return 'director';
                if (t.includes('finance') || t.includes('plan manager')) return 'finance';
                if (t.includes('strategic') || t.includes('business dev') || t.includes('client rel') || t.includes('marketing')) return 'strategic';
                if (t.includes('external') || t.includes('consultant')) return 'external';
                if (t.includes('support worker') || t.includes('day centre staff') || t.includes('staff')) return 'staff';
                return 'ops';
            };

            const searchLower = search.trim().toLowerCase();
            const nodeMatches = (node) => {
                if (!searchLower) return false;
                const staffNames = (node.staff || []).map(s => s.name).join(' ').toLowerCase();
                return (node.title || '').toLowerCase().includes(searchLower) || staffNames.includes(searchLower);
            };
            // Build the set of node ids that are a match, or an ancestor of a match, so the path
            // down to any hit stays fully visible/opaque while everything else dims.
            const visiblePathIds = React.useMemo(() => {
                const result = new Set();
                if (!searchLower || !orgData?.tree) return result;
                const walk = (nodes, path) => {
                    for (const n of nodes) {
                        const newPath = [...path, n.id];
                        if (nodeMatches(n)) newPath.forEach(id => result.add(id));
                        walk(n.children || [], newPath);
                    }
                };
                walk(orgData.tree, []);
                return result;
            }, [searchLower, orgData]);

            // Scroll the first match into view shortly after the user types
            React.useEffect(() => {
                if (!searchLower) return;
                const t = setTimeout(() => {
                    const firstMatchId = allNodes.find(n => nodeMatches(n))?.id;
                    if (firstMatchId != null && nodeRefs.current[firstMatchId]) {
                        nodeRefs.current[firstMatchId].scrollIntoView({ behavior:'smooth', block:'center', inline:'center' });
                    }
                }, 350);
                return () => clearTimeout(t);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [searchLower]);

            const toggleCollapse = (id) => {
                setCollapsedIds(prev => {
                    const next = new Set(prev);
                    next.has(id) ? next.delete(id) : next.add(id);
                    return next;
                });
            };

            // Render a position node from the API tree
            const renderTree = (node) => {
                const staffArr  = node.staff || [];
                const vacant    = node.is_vacant !== false && staffArr.length === 0;
                const primary   = staffArr[0];
                const extra     = staffArr.length > 1 ? `+${staffArr.length-1} more` : null;
                const type      = deriveType(node);
                const rawKids   = node.children || [];
                const isCollapsed = !searchLower && collapsedIds.has(node.id);
                const name  = vacant ? node.title : primary.name;
                const title = vacant ? null : node.title;
                const email = vacant ? null : primary.email;
                const card = (
                    <div ref={el => { if (el) nodeRefs.current[node.id] = el; }}>
                        <OrgCard
                            deptLabel={node.dept_label || null}
                            name={name}
                            title={title}
                            email={email}
                            type={type}
                            vacant={vacant}
                            extra={extra}
                            highlighted={nodeMatches(node)}
                            dimmed={!!searchLower && !visiblePathIds.has(node.id)}
                            hasChildren={rawKids.length > 0}
                            collapsed={isCollapsed}
                            onToggleCollapse={() => toggleCollapse(node.id)}
                            hiddenCount={orgCountDescendants(node)}
                            onClick={() => setSelectedNode({ node, type, vacant, name, title, email, deptLabel: node.dept_label })}
                        />
                    </div>
                );
                const children = isCollapsed ? [] : rawKids.map(c => renderTree(c));
                return <OrgTree key={node.id} card={card} gap={node.dept_label ? 14 : 10} ch={children}/>;
            };

            const zoomStep = (delta) => setZoomPct(Math.min(200, Math.max(30, Math.round((zoomPct ?? fitScale*100) + delta))));
            const zoomPctDisplay = Math.round(zoomPct ?? fitScale * 100);

            return (
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    {selectedNode && <OrgDetailModal {...selectedNode} onClose={() => setSelectedNode(null)} />}
                    <div style={{padding:'24px 28px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px',flexWrap:'wrap',gap:12}}>
                            <div>
                                <h1 style={{fontSize:'22px', fontWeight:'700', color:dm?'#E3BFDA':'#1E1B4B', margin:0, display:'flex', alignItems:'center', gap:'8px'}}><Icon name='building-2' size={20} color={dm?'#C77DB8':'#6D2773'} />Organizational Chart</h1>
                                <p style={{fontSize:'12px', color:dm?'#4a607f':'#94A3B8', margin:'4px 0 0'}}>Yahweh Care — live staff hierarchy. Updates instantly when staff are added or removed.</p>
                            </div>
                            <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                                <div style={{position:'relative'}}>
                                    <Icon name='search' size={13} color={dm?'#4a607f':'#94A3B8'} style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)'}} />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder='Search name or title…'
                                        style={{padding:'7px 10px 7px 30px', background:cardBg, border:`2px solid ${borderC}`, borderRadius:8, fontSize:12, color:dm?'#e5edff':'#1E1B4B', width:190, outline:'none'}}
                                    />
                                    {search && (
                                        <button onClick={() => setSearch('')} style={{position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex'}}>
                                            <Icon name='x' size={12} color={dm?'#4a607f':'#94A3B8'} />
                                        </button>
                                    )}
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:2, background:cardBg, border:`2px solid ${borderC}`, borderRadius:8, padding:'2px 4px'}}>
                                    <button onClick={() => zoomStep(-10)} title='Zoom out' style={{width:24,height:24,border:'none',background:'none',cursor:'pointer',fontSize:15,fontWeight:700,color:'#5D2162',lineHeight:1}}>−</button>
                                    <span style={{fontSize:11,fontWeight:700,color:dm?'#c0cfec':'#334155',minWidth:36,textAlign:'center'}}>{zoomPctDisplay}%</span>
                                    <button onClick={() => zoomStep(10)} title='Zoom in' style={{width:24,height:24,border:'none',background:'none',cursor:'pointer',fontSize:15,fontWeight:700,color:'#5D2162',lineHeight:1}}>+</button>
                                    <div style={{width:1,height:16,background:borderC,margin:'0 2px'}}/>
                                    <button onClick={() => setZoomPct(null)} title='Reset to fit' style={{padding:'0 8px',height:24,border:'none',background:'none',cursor:'pointer',fontSize:10.5,fontWeight:700,color:'#5D2162'}}>Fit</button>
                                </div>
                                <button onClick={fetchOrg} style={{padding:'7px 14px',background:cardBg,border:`2px solid ${borderC}`,borderRadius:'8px',fontSize:'12px',fontWeight:'600',color:'#5D2162',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
                                    <Icon name='refresh-cw' size={13} color='#5D2162' />Refresh
                                </button>
                            </div>
                        </div>

                        <div className='yc-detail-layout' style={{display:'flex', gap:'20px', alignItems:'flex-start', flexWrap:'wrap'}}>
                            {/* ── Chart card ── */}
                            <div style={{flex:1, minWidth:0, background:cardBg, borderRadius:'20px', border:`2px solid ${borderC}`, padding:'24px 24px 20px', boxShadow:'0 4px 20px rgba(109,39,115,0.08)'}}>
                                <h2 style={{textAlign:'center', fontSize:'19px', fontWeight:'800', color:dm?'#E3BFDA':'#1E1B4B', marginBottom:'20px', letterSpacing:'0.3px'}}>
                                    Organizational Chart for Yahweh Care
                                </h2>

                                <div className='yc-org-scroll'>
                                {loading && <div style={{textAlign:'center',padding:'60px',color:dm?'#4a607f':'#94A3B8',fontSize:'14px'}}>Loading org chart…</div>}
                                {error && <div style={{textAlign:'center',padding:'12px',fontSize:'13px',color:'#D97706',background:dm?'rgba(234,179,8,0.12)':'#FFFBEB',borderRadius:'8px',marginBottom:'16px',border:`1px solid ${dm?'rgba(234,179,8,0.3)':'#FDE68A'}`}}>{error}</div>}

                                {!loading && orgData && (
                                    <div ref={containerRef} style={{
                                        width:'100%', overflow:'auto', maxHeight:'68vh', borderRadius:12, padding:'8px 0',
                                        backgroundImage: dm
                                            ? 'radial-gradient(rgba(199,125,184,0.16) 1px, transparent 1px)'
                                            : 'radial-gradient(rgba(109,39,115,0.14) 1px, transparent 1px)',
                                        backgroundSize:'18px 18px',
                                    }}>
                                        <div style={{
                                            width: naturalSize.w ? naturalSize.w * effScale : 'auto',
                                            height: naturalSize.h ? naturalSize.h * effScale : 'auto',
                                            margin:'0 auto',
                                        }}>
                                            <div ref={chartWrapRef} style={{ transform:`scale(${effScale})`, transformOrigin:'top left', width:'fit-content', transition:'transform 0.15s ease' }}>
                                                {(() => {
                                                    // Show only meaningful roots: has children, or has staff, or is director-type
                                                    const roots = orgData.tree.filter(n =>
                                                        n.parent_position_id === null &&
                                                        (n.children?.length > 0 || (n.staff?.length > 0) || deriveType(n) === 'director')
                                                    );
                                                    return roots.length > 0
                                                        ? roots.map(root => renderTree(root))
                                                        : <p style={{color:dm?'#4a607f':'#94A3B8',fontSize:'13px',padding:'20px'}}>No org chart data.</p>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!loading && orgData && searchLower && visiblePathIds.size === 0 && (
                                    <p style={{textAlign:'center', fontSize:12.5, color:dm?'#4a607f':'#94A3B8', marginTop:12}}>No matches for "{search}".</p>
                                )}
                                </div>

                                {/* Legend */}
                                <div style={{marginTop:'20px', borderTop:`1px solid ${borderC}`, paddingTop:'16px'}}>
                                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', marginBottom:'10px'}}>
                                        <span style={{fontSize:'11px', fontWeight:'800', color:dm?'#c0cfec':'#334155', textTransform:'uppercase', letterSpacing:'0.06em', marginRight:'4px'}}>Legend</span>
                                        {Object.entries(ORG_TYPE_META).map(([key, l], i) => {
                                            const color = dm ? l.dark : l.light;
                                            return (
                                                <div key={i} style={{display:'flex',alignItems:'center',gap:'6px',padding:'4px 10px',borderRadius:'6px',border:`1.5px solid ${color}40`,background:`${color}0F`}}>
                                                    <div style={{width:'12px',height:'12px',borderRadius:'50%',background:color}}></div>
                                                    <span style={{fontSize:'11px',color:dm?'#c0cfec':'#334155',fontWeight:'500'}}>{l.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                                        <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:'11px',fontWeight:'700',background:'#ECFDF5',color:'#15803D',padding:'3px 12px',borderRadius:'20px',border:'1px solid #A7F3D0'}}><span style={{width:6,height:6,borderRadius:'50%',background:'#10B981'}}/>Active Position</span>
                                        <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:'11px',fontWeight:'700',background:dm?'rgba(239,68,68,0.15)':'#FEF2F2',color:dm?'#fca5a5':'#DC2626',padding:'3px 12px',borderRadius:'20px',border:'1px solid #FCA5A5'}}><span style={{width:6,height:6,borderRadius:'50%',background:'#EF4444'}}/>Vacant Position</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Sidebar ── */}
                            <div style={{width:'270px', flexShrink:0, display:'flex', flexDirection:'column', gap:'14px'}}>
                                {/* System Roles */}
                                <div style={{background:cardBg, borderRadius:'16px', border:'2px solid #E3BFDA', padding:'16px', boxShadow:'0 2px 10px rgba(109,39,115,0.1)'}}>
                                    <p style={{fontSize:'11px',fontWeight:'800',color:'white',textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 14px',padding:'6px 10px',background:'#5D2162',borderRadius:'8px',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Icon name='settings' size={12} color='white' />System Roles (Not Part of Org Hierarchy)</p>
                                    {sysRoles.length === 0 && <p style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',textAlign:'center',padding:'8px'}}>Loading…</p>}
                                    {sysRoles.map((r,i)=>(
                                        <div key={i} style={{display:'flex',gap:'12px',marginBottom:'12px',padding:'12px',background:dm?'rgba(109,39,115,0.08)':'#F8F9FF',borderRadius:'12px',border:'1.5px solid #EAD6E6',alignItems:'flex-start'}}>
                                            <div style={{width:'40px',height:'40px',borderRadius:'50%',background: i===0 ? '#DBEAFE' : '#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                                <Icon name={i===0 ? 'user' : 'shield'} size={20} color={i===0 ? '#1D4ED8' : '#6D28D9'} />
                                            </div>
                                            <div style={{flex:1,minWidth:0}}>
                                                <p style={{fontSize:'14px',fontWeight:'700',color:dm?'#E3BFDA':'#1E1B4B',margin:'0 0 2px'}}>{r.name}</p>
                                                <p style={{fontSize:'11px',color:dm?'#C77DB8':'#6D2773',fontWeight:'600',margin:'0 0 3px'}}>{i===0 ? 'Bootstrap Admin' : 'Bootstrap Super Admin'}</p>
                                                <p style={{fontSize:'10px',color:'#2563EB',margin:'0 0 6px',wordBreak:'break-all'}}>Email: {r.email}</p>
                                                <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:'10px',fontWeight:'700',background:'#DCFCE7',color:'#15803D',padding:'2px 10px',borderRadius:'20px',border:'1px solid #86EFAC'}}><span style={{width:5,height:5,borderRadius:'50%',background:'#10B981'}}/>Active</span>
                                            </div>
                                        </div>
                                    ))}
                                    <p style={{fontSize:'11px',color:textM,lineHeight:'1.6',margin:0,padding:'10px',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF',borderRadius:'8px',border:`1px solid ${borderC}`}}>Has full system access and control at the platform level. Not included in the organizational reporting structure.</p>
                                </div>

                                {/* Notes */}
                                <div style={{background:cardBg,borderRadius:'16px',border:`2px solid ${borderC}`,padding:'16px',boxShadow:'0 2px 8px rgba(109,39,115,0.07)'}}>
                                    <p style={{fontSize:'12px',fontWeight:'800',color:dm?'#E3BFDA':'#1E1B4B',textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 12px',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='file-edit' size={13} color={dm?'#C77DB8':'#6D2773'} />Notes</p>
                                    {[
                                        'Only active positions are assigned to current staff.',
                                        'All vacant positions are kept in the structure for future growth and scalability.',
                                        'System roles (e.g., Bootstrap Admin, Bootstrap Super Admin) are separate from the organizational hierarchy.',
                                        'Click any card to view full details. Use the chevron below a card to collapse its branch.',
                                    ].map((n,i)=>(
                                        <div key={i} style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                                            <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#833089',flexShrink:0,marginTop:'5px'}}></div>
                                            <p style={{fontSize:'12px',color:dm?'#c0cfec':'#334155',margin:0,lineHeight:'1.6'}}>{n}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Live Stats */}
                                <div style={{background:'#6D2773',borderRadius:'16px',padding:'16px',color:'white'}}>
                                    <p style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.08em',opacity:0.8,margin:'0 0 10px'}}>Quick Stats</p>
                                    {[
                                        {l:'Total Positions', v: allNodes.length || '—'},
                                        {l:'Active Staff',    v: activeCount || '—'},
                                        {l:'Vacant Positions',v: vacantCount || '—'},
                                        {l:'Departments',     v: deptCount   || '—'},
                                    ].map((s,i)=>(
                                        <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                                            <span style={{fontSize:'12px',opacity:0.85}}>{s.l}</span>
                                            <span style={{fontSize:'13px',fontWeight:'700'}}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            );
        });

        // ============================================================
        // STAFF MANAGEMENT PAGE
        // ============================================================
        const StaffManagementPage = React.memo(function StaffManagementPage() {
            const EMP_TYPES = { full_time:'Full Time', part_time:'Part Time', casual:'Casual', contractor:'Contractor' };
            const POS_TYPES  = ['director','ops','finance','strategic','staff','external'];
            const EMPTY_FORM = {
                name:'', email:'', phone:'', address:'', employment_type:'full_time',
                department_id:'', manager_id:'', start_date:'',
                profile_notes:'', position_ids:[], auth_provider:'azure_ad',
                profile_photo_url:'', vehicle_access:false
            };


            const dm = useDark();
            const pageBg  = dm ? '#0F172A' : '#F9FAFB';
            const cardBg  = dm ? '#1E293B' : '#FFFFFF';
            const borderC = dm ? '#334155' : '#E2E8F0';
            const textP   = dm ? '#E2E8F0' : '#1E293B';
            const textM   = dm ? '#94A3B8' : '#6B7280';
            const BRAND   = '#6D2773';
            const sessionUser = React.useMemo(() => getSessionUser(), []);
            const canDelete   = sessionUser?.isBootstrapAdmin === true; // only Ron / Alex can delete staff or positions
            const [staff,       setStaff]       = React.useState([]);
            const [departments, setDepts]        = React.useState([]);
            const [positions,   setPositions]    = React.useState([]);
            const [loading,     setLoading]      = React.useState(true);
            const [search,      setSearch]       = React.useState('');
            const debouncedStaffSearch = useDebounce(search, 150);
            const [deptFilter,  setDeptFilter]   = React.useState('all');
            const [showModal,   setShowModal]    = React.useState(false);
            const [modalMode,   setModalMode]    = React.useState('add');
            const [selStaff,    setSelStaff]     = React.useState(null);
            const [delConfirm,  setDelConfirm]   = React.useState(null);
            const [delPosConfirm, setDelPosConfirm] = React.useState(null);
            const [posDeleteError, setPosDeleteError] = React.useState('');
            const [showPosModal,setShowPosModal] = React.useState(false);
            const [saving,      setSaving]       = React.useState(false);
            const [error,       setError]        = React.useState('');
            const [toast,       setToast]        = React.useState(null);
            const [form,        setForm]         = React.useState(EMPTY_FORM);
            const [posForm,     setPosForm]      = React.useState({ title:'', department_id:'', position_type:'staff', dept_label:'', parent_id:'' });

            const showToast = (message, tone='success') => { setToast({message, tone}); setTimeout(()=>setToast(null),3000); };

            const fetchAll = React.useCallback(async () => {
                setLoading(true);
                try {
                    const uqp = getUserQueryParams(getSessionUser());
                    // Only active staff belong here — deactivated staff move to the
                    // Ex-Staff page (bootstrap-admin only) so they don't clutter this list.
                    const [sR,dR,pR] = await Promise.all([
                        fetch(`${HRMS_API}/users?limit=200&status=active${uqp}`, { credentials:'include', headers: authHeaders() }),
                        fetch(`${HRMS_API}/org/departments`,        { credentials:'include', headers: authHeaders() }),
                        fetch(`${HRMS_API}/org/positions`,          { credentials:'include', headers: authHeaders() }),
                    ]);
                    const [sd,dd,pd] = await Promise.all([sR.json(),dR.json(),pR.json()]);
                    // YCTMBackend returns { users } for /users and { departments } and { positions }
                    const rawStaff = sd.users || sd.staff || [];
                    // Normalize to the shape the page expects
                    const normalised = rawStaff.map(u => ({
                        ...u,
                        is_active: u.active !== false,
                        department_name: u.department || '',
                        positions: Array.isArray(u.positions) && u.positions.length > 0 ? u.positions : (u.position_id ? [{ id: u.position_id, title: u.position_title || '', type: 'ops', is_primary: true }] : []),
                        auth_provider: u.auth_provider || (u.microsoft_id ? 'azure_ad' : 'local'),
                    }));
                    setStaff(normalised);
                    setDepts(dd.departments || []);
                    setPositions(pd.positions || []);
                } catch(e) { setError('Failed to load staff data: ' + e.message); }
                finally { setLoading(false); }
            }, []);

            React.useEffect(() => { fetchAll(); }, [fetchAll]);

            const filtered = React.useMemo(() => {
                const q = debouncedStaffSearch.toLowerCase();
                return staff.filter(s =>
                    (!q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) ||
                        (s.positions||[]).some(p=>p.title?.toLowerCase().includes(q))) &&
                    (deptFilter==='all' || String(s.department_id)===deptFilter)
                );
            }, [staff, debouncedStaffSearch, deptFilter]);

            const openAdd = () => { setForm(EMPTY_FORM); setModalMode('add'); setSelStaff(null); setError(''); setShowModal(true); };
            const openEdit = (m) => {
                setForm({
                    name: m.name||'', email: m.email||'', phone: m.phone||'', address: m.address||'',
                    employment_type: m.employment_type||'full_time',
                    department_id: m.department_id||'', manager_id: m.manager_id||'',
                    start_date: m.start_date ? m.start_date.slice(0,10) : '',
                    profile_notes: m.profile_notes||'',
                    position_ids: (m.positions||[]).map(p=>p.id),
                    auth_provider: m.auth_provider||'azure_ad',
                    profile_photo_url: m.profile_photo_url||'',
                    vehicle_access: m.vehicle_access===true
                });
                setSelStaff(m); setModalMode('edit'); setError(''); setShowModal(true);
            };

            const handleSave = async () => {
                if (!form.name.trim()) return setError('Name is required');
                if (!form.email.trim()) return setError('Email is required');
                const emailDomain = form.email.trim().split('@')[1] || '';
                if (!['yahwehcare.com.au','yahwehpc.com.au'].includes(emailDomain)) {
                    return setError('Email must be a @yahwehcare.com.au or @yahwehpc.com.au address to allow Microsoft Entra login.');
                }
                setSaving(true); setError('');
                try {
                    // Use single position_id (first selected) — org chart links one user → one position
                    const payload = {
                        name:            form.name.trim(),
                        email:           form.email.trim(),
                        phone:           form.phone || null,
                        address:         form.address || null,
                        employment_type: form.employment_type || 'full_time',
                        department_id:   form.department_id   || null,
                        manager_id:      form.manager_id      || null,
                        start_date:      form.start_date      || null,
                        profile_notes:   form.profile_notes   || null,
                        position_id:     form.position_ids?.length ? form.position_ids[0] : null,
                        position_ids:    form.position_ids || [],
                        auth_provider:   form.auth_provider   || 'azure_ad',
                        is_active:       true,
                        profile_photo_url: form.profile_photo_url || null,
                        vehicle_access:  form.vehicle_access === true,
                    };
                    const url    = modalMode==='add' ? `${HRMS_API}/users` : `${HRMS_API}/users/${selStaff.id}`;
                    const method = modalMode==='add' ? 'POST' : 'PATCH';
                    const res = await authFetch(url, { method, body:JSON.stringify(payload) });
                    if (!res.ok) {
                        const e = await res.json().catch(()=>({}));
                        if (res.status === 401) throw new Error('Session expired — please sign out and sign back in.');
                        throw new Error(e.error || e.message || 'Save failed');
                    }
                    setShowModal(false);
                    showToast(modalMode==='add' ? 'Staff member added' : 'Staff member updated');
                    fetchAll();
                } catch(e) { setError(e.message); }
                finally { setSaving(false); }
            };

            const handleDelete = async () => {
                if (!delConfirm) return;
                try {
                    const res  = await authFetch(`${HRMS_API}/users/${delConfirm.id}`, { method:'DELETE' });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || data.message || 'Delete failed');
                    setDelConfirm(null);
                    showToast(data.message || 'Staff member deactivated');
                    fetchAll();
                } catch(e) { setError(e.message); }
            };

            const handleAddPosition = async () => {
                if (!posForm.title.trim()) return;
                try {
                    const body = JSON.stringify({
                        title:           posForm.title.trim(),
                        departmentId:    posForm.department_id || null,
                        parentPositionId:posForm.parent_id     || null,
                        sortOrder:       0,
                    });
                    const res = await authFetch(`${HRMS_API}/org/positions`, {
                        method:'POST', body
                    });
                    if (!res.ok) { const e=await res.json(); throw new Error(e.error || e.message); }
                    const data = await res.json();
                    setPositions(prev=>[...prev, data.position]);
                    setForm(f=>({...f, position_ids:[...f.position_ids, data.position.id]}));
                    setShowPosModal(false);
                    setPosForm({ title:'', department_id:'', position_type:'staff', dept_label:'', parent_id:'' });
                    showToast('Position created');
                } catch(e) { setError(e.message); }
            };

            const handleDeletePosition = async () => {
                if (!delPosConfirm) return;
                setPosDeleteError('');
                try {
                    const res  = await authFetch(`${HRMS_API}/org/positions/${delPosConfirm.id}`, { method:'DELETE' });
                    const data = await res.json().catch(()=>({}));
                    if (!res.ok) throw new Error(data.message || data.error || 'Delete failed');
                    setPositions(prev => prev.filter(p => p.id !== delPosConfirm.id));
                    setForm(f => ({ ...f, position_ids: f.position_ids.filter(id => id !== delPosConfirm.id) }));
                    setDelPosConfirm(null);
                    showToast(data.message || 'Position deleted');
                } catch(e) { setPosDeleteError(e.message); }
            };

            const togglePos = (id) => setForm(f=>({
                ...f,
                position_ids: f.position_ids.includes(id)
                    ? f.position_ids.filter(x=>x!==id)
                    : [...f.position_ids, id]
            }));

            const posTypeColor = { director:'#6D2773', ops:'#0A6ABD', finance:'#5B892E', strategic:'#874E8C', staff:'#3685C9', external:'#99CE64' };

            const Avatar = ({name, photoUrl, size=36}) => {
                const ini=(name||'').split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('');
                const colors=['#6D2773','#0A6ABD','#689C35','#874E8C','#3685C9','#4E7528'];
                const bg=colors[(name||'').charCodeAt(0)%colors.length];
                if (photoUrl) return <img src={photoUrl} alt="" style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>;
                return <div style={{width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.36,fontWeight:600,letterSpacing:'0.02em',color:'white',flexShrink:0}}>{ini}</div>;
            };

            const inputStyle = { width:'100%', padding:'8px 10px', border:`1px solid ${borderC}`, borderRadius:'6px', fontSize:'13px', boxSizing:'border-box' };
            const labelStyle = { fontSize:'12px', fontWeight:'600', color:dm?'#c0cfec':'#334155', marginBottom:'4px', display:'block' };

            return (
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    {/* Toast */}
                    {toast && (
                        <div style={{position:'fixed',top:20,right:20,zIndex:9999,background:dm?'#1E293B':'#0F172A',color:'#fff',padding:'10px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:'600',boxShadow:'0 4px 16px rgba(0,0,0,0.25)',display:'flex',alignItems:'center',gap:'8px'}}>
                            <Icon name={toast.tone==='error'?'alert-triangle':'check-circle'} size={15} color={toast.tone==='error'?'#F87171':'#34D399'} />
                            {toast.message}
                        </div>
                    )}

                    <div style={{padding:'24px 28px'}}>
                        {/* Header */}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:BRAND,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 3px 10px ${BRAND}55`}}>
                                    <Icon name='briefcase' size={19} color='#fff' />
                                </div>
                                <div>
                                    <h1 style={{fontSize:'22px',fontWeight:'700',color:textP,margin:0}}>Staff Management</h1>
                                    <p style={{fontSize:'12px',color:textM,margin:'2px 0 0'}}>Add, manage, and organise Yahweh Care staff — changes update the Org Chart instantly</p>
                                </div>
                            </div>
                            <div style={{display:'flex',gap:'10px'}}>
                                <button onClick={()=>setShowPosModal(true)}
                                    style={{padding:'9px 16px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',color:textP,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px'}}>
                                    <Icon name='tag' size={13} color={textM} />{canDelete ? 'Manage Positions' : 'New Position'}
                                </button>
                                <button onClick={openAdd}
                                    style={{padding:'9px 18px',background:BRAND,color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px'}}>
                                    <Icon name='plus-circle' size={14} color='#fff' />Add Staff Member
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div style={{display:'flex',gap:'10px',marginBottom:'16px',flexWrap:'wrap'}}>
                            <input type="text" placeholder="Search name, email or position…" value={search} onChange={e=>setSearch(e.target.value)}
                                style={{flex:1,minWidth:'200px',padding:'8px 12px',border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',background:cardBg,color:textP}} />
                            <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
                                style={{padding:'8px 12px',border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',background:cardBg,color:textP}}>
                                <option value="all">All Departments</option>
                                {departments.map(d=><option key={d.id} value={String(d.id)}>{d.name}</option>)}
                            </select>
                            <div style={{padding:'8px 14px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',color:textP,fontWeight:'600'}}>
                                {filtered.length} staff
                            </div>
                        </div>

                        {/* Error */}
                        {error && !showModal && (
                            <div style={{background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',border:`1px solid ${dm?'rgba(239,68,68,0.3)':'#FECACA'}`,borderRadius:'8px',padding:'10px 14px',marginBottom:'12px',fontSize:'13px',color:'#DC2626',display:'flex',alignItems:'center',gap:'6px'}}>
                                <Icon name='alert-triangle' size={13} color='#DC2626' /> {error}
                            </div>
                        )}

                        {/* Staff Table */}
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,overflow:'hidden'}}>
                            {loading ? (
                                <div style={{padding:'40px',textAlign:'center',color:textM,fontSize:'14px'}}>Loading staff…</div>
                            ) : filtered.length === 0 ? (
                                <div style={{padding:'40px',textAlign:'center',color:textM,fontSize:'14px'}}>No staff found</div>
                            ) : (
                                <table style={{width:'100%',borderCollapse:'collapse'}}>
                                    <thead>
                                        <tr style={{background:dm?'#0F172A':'#F8FAFC',borderBottom:`1px solid ${borderC}`}}>
                                            {['Staff Member','Positions','Department','Employment','Login','Actions'].map(h=>(
                                                <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:'11px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(m=>(
                                            <tr key={m.id} style={{borderBottom:`1px solid ${borderC}`}} className="table-row">
                                                <td style={{padding:'12px 14px'}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                        <Avatar name={m.name} photoUrl={m.profile_photo_url} size={34}/>
                                                        <div>
                                                            <div style={{fontSize:'13px',fontWeight:'700',color:textP,display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                                {m.name}
                                                                {m.is_bootstrap_admin && (
                                                                    <span title="System Administration — not part of org hierarchy" style={{display:'inline-flex',alignItems:'stretch',borderRadius:'6px',overflow:'hidden',fontSize:'9px',fontWeight:'600',border:`1px solid ${dm?'rgba(109,39,115,0.35)':'#DBC9DC'}`}}>
                                                                        <span style={{background:'#6D2773',color:'#fff',padding:'2px 5px',display:'flex',alignItems:'center'}}><Icon name='star' size={9} color='#fff' /></span>
                                                                        <span style={{background:dm?'rgba(109,39,115,0.16)':'#F0E9F1',color:dm?'#A073A4':'#521D56',padding:'2px 7px'}}>Bootstrap Admin</span>
                                                                    </span>
                                                                )}
                                                                {!m.is_bootstrap_admin && (m.positions||[]).some(p=>(p.type||p.position_type||'').toLowerCase()==='director') && (
                                                                    <span title="Organisational Leadership — part of org hierarchy" style={{display:'inline-flex',alignItems:'stretch',borderRadius:'6px',overflow:'hidden',fontSize:'9px',fontWeight:'600',border:`1px solid ${dm?'rgba(109,39,115,0.35)':'#DBC9DC'}`}}>
                                                                        <span style={{background:'#6D2773',color:'#fff',padding:'2px 5px',display:'flex',alignItems:'center'}}><Icon name='building-2' size={9} color='#fff' /></span>
                                                                        <span style={{background:dm?'rgba(109,39,115,0.16)':'#F0E9F1',color:dm?'#A073A4':'#521D56',padding:'2px 7px'}}>Director</span>
                                                                    </span>
                                                                )}
                                                                {!m.is_bootstrap_admin && m.vehicle_access && (
                                                                    <span title="Individually granted access to Vehicle Management" style={{display:'inline-flex',alignItems:'stretch',borderRadius:'6px',overflow:'hidden',fontSize:'9px',fontWeight:'600',border:'1px solid #A9CFA0'}}>
                                                                        <span style={{background:'#5F8F6E',color:'#fff',padding:'2px 5px',display:'flex',alignItems:'center'}}><Icon name='truck' size={9} color='#fff' /></span>
                                                                        <span style={{background:dm?'rgba(95,143,110,0.16)':'#EAF4EC',color:dm?'#8FD3A3':'#2F5E3F',padding:'2px 7px'}}>Vehicle Access</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{fontSize:'11px',color:textM}}>{m.email}</div>
                                                            {m.phone && <div style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8'}}>{m.phone}</div>}
                                                            {m.address && <div title={m.address} style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.address}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{padding:'12px 14px'}}>
                                                    {(m.positions||[]).length === 0 ? (
                                                        <span style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',fontStyle:'italic'}}>No position assigned</span>
                                                    ) : (
                                                        <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                                                            {(m.positions||[]).map(p=>{
                                                                const pc = posTypeColor[p.type]||'#833089';
                                                                return p.is_primary ? (
                                                                    <span key={p.id} title="Primary position" style={{display:'inline-flex',alignItems:'stretch',borderRadius:'6px',overflow:'hidden',fontSize:'10px',fontWeight:'600',border:`1px solid ${pc}35`}}>
                                                                        <span style={{background:pc,color:'#fff',padding:'2px 6px',display:'flex',alignItems:'center'}}><Icon name='star' size={9} color='#fff' /></span>
                                                                        <span style={{background:`${pc}18`,color:pc,padding:'2px 8px'}}>{p.title}</span>
                                                                    </span>
                                                                ) : (
                                                                    <span key={p.id} style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'6px',background:`${pc}15`,color:pc,border:`1px solid ${pc}30`,display:'inline-flex',alignItems:'center',gap:'3px'}}>
                                                                        {p.title}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{padding:'12px 14px',fontSize:'12px',color:dm?'#c0cfec':'#334155'}}>{m.department_name||'—'}</td>
                                                <td style={{padding:'12px 14px'}}>
                                                    <span style={{display:'inline-flex',alignItems:'stretch',borderRadius:'6px',overflow:'hidden',fontSize:'11px',fontWeight:'600',whiteSpace:'nowrap',border:`1px solid ${dm?'rgba(10,106,189,0.35)':'#C2DAEF'}`}}>
                                                        <span style={{background:'#0A6ABD',color:'#fff',padding:'3px 7px',display:'flex',alignItems:'center'}}><Icon name='briefcase' size={11} color='#fff' /></span>
                                                        <span style={{background:dm?'rgba(10,106,189,0.16)':'#E2EDF7',color:dm?'#9CC3E8':'#07477F',padding:'3px 9px'}}>{EMP_TYPES[m.employment_type]||m.employment_type||'—'}</span>
                                                    </span>
                                                </td>
                                                <td style={{padding:'12px 14px'}}>
                                                    {(() => {
                                                        const isAzure = m.auth_provider==='azure_ad';
                                                        const pc = isAzure ? '#0A6ABD' : '#5B892E';
                                                        const tint = isAzure ? (dm?'rgba(10,106,189,0.16)':'#E2EDF7') : (dm?'rgba(91,137,46,0.16)':'#EBF1E6');
                                                        const txt = isAzure ? (dm?'#9CC3E8':'#07477F') : (dm?'#9DB882':'#3D5C1F');
                                                        return (
                                                            <span style={{display:'inline-flex',alignItems:'stretch',borderRadius:'6px',overflow:'hidden',fontSize:'11px',fontWeight:'600',whiteSpace:'nowrap',border:`1px solid ${pc}35`}}>
                                                                <span style={{background:pc,color:'#fff',padding:'3px 7px',display:'flex',alignItems:'center'}}>
                                                                    <Icon name={isAzure?'shield':'key'} size={11} color='#fff' />
                                                                </span>
                                                                <span style={{background:tint,color:txt,padding:'3px 9px'}}>
                                                                    {isAzure ? 'Microsoft Entra' : 'Local'}
                                                                </span>
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td style={{padding:'12px 14px'}}>
                                                    <div style={{display:'flex',gap:'6px'}}>
                                                        <button onClick={()=>openEdit(m)}
                                                            style={{padding:'5px 12px',background:'transparent',border:`1px solid ${borderC}`,borderRadius:'6px',fontSize:'11px',fontWeight:'600',color:textP,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px',transition:'background 0.12s ease, border-color 0.12s ease'}}
                                                            onMouseEnter={e=>{e.currentTarget.style.background=dm?'rgba(255,255,255,0.04)':'#F8FAFC';e.currentTarget.style.borderColor=dm?'#475569':'#CBD5E1';}}
                                                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=borderC;}}>
                                                            <Icon name='pencil' size={11} color={textM} />Edit
                                                        </button>
                                                        {!m.is_bootstrap_admin && canDelete && (
                                                            <button onClick={()=>setDelConfirm(m)} title="Bootstrap Admin Only"
                                                                style={{padding:'5px 12px',background:'transparent',border:`1px solid ${dm?'rgba(176,101,91,0.4)':'#E4CFCB'}`,borderRadius:'6px',fontSize:'11px',fontWeight:'600',color:dm?'#c99b93':'#8B4A41',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px',transition:'background 0.12s ease'}}
                                                                onMouseEnter={e=>{e.currentTarget.style.background=dm?'rgba(176,101,91,0.12)':'#F7ECEA';}}
                                                                onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                                                                <Icon name='trash-2' size={11} color={dm?'#c99b93':'#8B4A41'} />Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Stats row */}
                        {!loading && (
                            <div style={{display:'flex',gap:'12px',marginTop:'14px',flexWrap:'wrap'}}>
                                {[
                                    {label:'Total Staff',   val:staff.length,                                                color:'#5B7C99', icon:'users'},
                                    {label:'Active',        val:staff.filter(s=>s.is_active).length,                        color:'#5F8F6E', icon:'check-circle'},
                                    {label:'Unassigned',    val:staff.filter(s=>s.is_active&&(s.positions||[]).length===0).length, color:'#A0824F', icon:'alert-triangle'},
                                    {label:'Entra Login',   val:staff.filter(s=>s.auth_provider==='azure_ad').length,        color:'#7D8CA3', icon:'shield'},
                                    {label:'Vacant Positions', val:positions.filter(p=>p.is_vacant).length,                  color:'#B0655B', icon:'tag'},
                                ].map(s=>(
                                    <div key={s.label} className="stat-card" style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'10px',padding:'10px 16px',display:'flex',gap:'10px',alignItems:'center',cursor:'default'}}>
                                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:s.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                            <Icon name={s.icon} size={13} color='#fff' />
                                        </div>
                                        <div>
                                            <div style={{fontSize:'18px',fontWeight:'700',color:textP,lineHeight:1.1}}>{s.val}</div>
                                            <div style={{fontSize:'11px',color:textM,fontWeight:'600'}}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── ADD/EDIT STAFF MODAL ─────────────────────────────── */}
                    {showModal && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
                            <div style={{background:cardBg,borderRadius:'16px',width:'100%',maxWidth:'680px',maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
                                {/* Modal header */}
                                <div style={{padding:'18px 24px',borderBottom:`1px solid ${borderC}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:cardBg,borderRadius:'16px 16px 0 0'}}>
                                    <h2 style={{fontSize:'16px',fontWeight:'700',color:textP,margin:0}}>
                                        <span style={{display:'flex',alignItems:'center',gap:'6px'}}>{modalMode==='add'?<Icon name='plus-circle' size={16} color={BRAND} />:<Icon name='pencil' size={16} color={BRAND} />}{modalMode==='add'?'Add New Staff Member':'Edit Staff Member'}</span>
                                    </h2>
                                    <button onClick={()=>setShowModal(false)} style={{background:'transparent',border:'none',color:textM,borderRadius:'6px',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='x' size={16} color={textM} /></button>
                                </div>

                                <div style={{padding:'20px 24px'}}>
                                    {error && <div style={{background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',border:`1px solid ${dm?'rgba(239,68,68,0.3)':'#FECACA'}`,borderRadius:'8px',padding:'8px 12px',marginBottom:'14px',fontSize:'12px',color:'#DC2626',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='alert-triangle' size={12} color='#DC2626' />{error}</div>}

                                    {/* Profile photo */}
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'18px'}}>
                                        <AvatarUpload
                                            name={form.name}
                                            photoUrl={form.profile_photo_url}
                                            size={76}
                                            onPhotoChange={(dataUrl)=>setForm(f=>({...f, profile_photo_url:dataUrl}))}
                                            onError={(msg)=>setError(msg)}
                                        />
                                    </div>

                                    {/* Login method notice */}
                                    <div style={{background:dm?'rgba(59,130,246,0.08)':'#EFF6FF',border:`1px solid ${dm?'rgba(59,130,246,0.25)':'#BFDBFE'}`,borderRadius:'8px',padding:'10px 14px',marginBottom:'16px',fontSize:'12px',color:dm?'#93c5fd':'#1E40AF'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                                            <Icon name='shield' size={14} color={dm?'#93c5fd':'#1D4ED8'} />
                                            <strong>Microsoft Entra Login</strong>
                                        </div>
                                        <ul style={{margin:'4px 0 0 24px',padding:0,lineHeight:'1.7'}}>
                                            <li>Staff log in via <strong>"Sign in with Microsoft"</strong> — no password needed.</li>
                                            <li>The email entered here <strong>must exactly match</strong> their Microsoft 365 / Azure AD email address.</li>
                                            <li>Once added, they can sign in immediately — no further setup required.</li>
                                        </ul>
                                    </div>

                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                                        {/* Full Name */}
                                        <div style={{gridColumn:'1/-1'}}>
                                            <label style={labelStyle}>Full Name <span style={{color:'#DC2626'}}>*</span></label>
                                            <input style={inputStyle} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Jane Smith"/>
                                        </div>
                                        {/* Email */}
                                        <div>
                                            <label style={labelStyle}>Email Address <span style={{color:'#DC2626'}}>*</span></label>
                                            <input
                                                style={{...inputStyle, borderColor: form.email && !['yahwehcare.com.au','yahwehpc.com.au'].includes(form.email.split('@')[1]||'') ? '#F59E0B' : inputStyle.borderColor}}
                                                type="email"
                                                value={form.email}
                                                onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                                                placeholder="jane@yahwehcare.com.au"
                                            />
                                            {form.email && !['yahwehcare.com.au','yahwehpc.com.au'].includes(form.email.split('@')[1]||'') && (
                                                <p style={{fontSize:12,color:'#B45309',marginTop:4,display:'flex',alignItems:'flex-start',gap:'4px'}}>
                                                    <Icon name='alert-triangle' size={12} color='#B45309' style={{flexShrink:0,marginTop:'2px'}} />Must be a <strong>@yahwehcare.com.au</strong> or <strong>@yahwehpc.com.au</strong> address — this must match their Microsoft Entra account exactly.
                                                </p>
                                            )}
                                            {form.email && ['yahwehcare.com.au','yahwehpc.com.au'].includes(form.email.split('@')[1]||'') && (
                                                <p style={{fontSize:12,color:'#16A34A',marginTop:4,display:'flex',alignItems:'center',gap:'4px'}}><Icon name='check-circle' size={12} color='#16A34A' />Valid organisation domain</p>
                                            )}
                                        </div>
                                        {/* Phone */}
                                        <div>
                                            <label style={labelStyle}>Phone Number</label>
                                            <input style={inputStyle} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+61 4xx xxx xxx"/>
                                        </div>
                                        {/* Address */}
                                        <div style={{gridColumn:'1/-1'}}>
                                            <label style={labelStyle}>Address</label>
                                            <input style={inputStyle} value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Street, suburb, state, postcode"/>
                                        </div>
                                        {/* Positions */}
                                        <div style={{gridColumn:'1/-1'}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                                <label style={{...labelStyle,margin:0}}>Org Chart Positions <span style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8',fontWeight:'400'}}>(one staff can hold multiple)</span></label>
                                                <button onClick={()=>setShowPosModal(true)} style={{fontSize:'11px',fontWeight:'600',color:BRAND,background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',border:'none',borderRadius:'6px',padding:'3px 8px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px'}}><Icon name='plus-circle' size={11} color={BRAND} />New Position</button>
                                            </div>
                                            <div style={{border:`1.5px solid ${borderC}`,borderRadius:'8px',maxHeight:'160px',overflow:'auto',padding:'8px'}}>
                                                {positions.length===0 ? (
                                                    <p style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',textAlign:'center',padding:'10px'}}>No positions found</p>
                                                ) : positions.map(p=>(
                                                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'5px 6px',borderRadius:'6px',background:form.position_ids.includes(p.id)?`${posTypeColor[p.position_type]||'#833089'}10`:'transparent'}}>
                                                        <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',flex:1,minWidth:0}}>
                                                            <input type="checkbox" checked={form.position_ids.includes(p.id)} onChange={()=>togglePos(p.id)}/>
                                                            <span style={{fontSize:'12px',color:dm?'#c0cfec':'#334155',flex:1}}>{p.title}</span>
                                                        </label>
                                                        <span style={{fontSize:'10px',fontWeight:'600',color:posTypeColor[p.position_type]||'#833089',background:`${posTypeColor[p.position_type]||'#833089'}15`,padding:'1px 6px',borderRadius:'8px'}}>{p.position_type}</span>
                                                        {!p.is_vacant && <span style={{fontSize:'10px',color:'#15803D',background:'#DCFCE7',padding:'1px 6px',borderRadius:'8px'}}>Occupied</span>}
                                                        {p.is_vacant && <span style={{fontSize:'10px',color:'#DC2626',background:dm?'rgba(239,68,68,0.15)':'#FEF2F2',padding:'1px 6px',borderRadius:'8px'}}>Vacant</span>}
                                                        {canDelete && (
                                                            <button type="button" title="Delete position (Bootstrap Admin Only)"
                                                                onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setPosDeleteError(''); setDelPosConfirm(p); }}
                                                                style={{background:'none',border:'none',cursor:'pointer',padding:'2px',display:'flex',flexShrink:0}}>
                                                                <Icon name='trash-2' size={12} color={dm?'#fca5a5':'#DC2626'} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {form.position_ids.length>0 && (
                                                <p style={{fontSize:'11px',color:dm?'#C77DB8':'#6D2773',marginTop:'4px',display:'flex',alignItems:'center',gap:'4px'}}><Icon name='check' size={11} color={dm?'#C77DB8':'#6D2773'} />{form.position_ids.length} position(s) selected — first is primary</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Management access override */}
                                <div style={{padding:'0 24px 16px'}}>
                                    <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',border:`1.5px solid ${form.vehicle_access ? BRAND : borderC}`,borderRadius:'8px',padding:'10px 12px',background:form.vehicle_access ? `${BRAND}10` : 'transparent'}}>
                                        <input type="checkbox" checked={form.vehicle_access} onChange={e=>setForm(f=>({...f,vehicle_access:e.target.checked}))}/>
                                        <Icon name='truck' size={15} color={form.vehicle_access ? BRAND : textM} />
                                        <div>
                                            <div style={{fontSize:'12.5px',fontWeight:'600',color:textP}}>Vehicle Management Access</div>
                                            <div style={{fontSize:'11px',color:textM}}>Grant access to Vehicle Management regardless of role</div>
                                        </div>
                                    </label>
                                </div>

                                {/* Modal footer */}
                                <div style={{padding:'16px 24px',borderTop:`1px solid ${borderC}`,display:'flex',justifyContent:'flex-end',gap:'10px',background:dm?'#0F172A':'#F8FAFC',borderRadius:'0 0 16px 16px'}}>
                                    <button onClick={()=>setShowModal(false)} style={{padding:'9px 18px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',color:textM,cursor:'pointer'}}>Cancel</button>
                                    <button onClick={handleSave} disabled={saving} style={{padding:'9px 20px',background:BRAND,color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',opacity:saving?0.7:1}}>
                                        {saving ? 'Saving…' : (modalMode==='add'?'Add Staff Member':'Save Changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MANAGE POSITIONS MODAL (create + delete) ───────────── */}
                    {showPosModal && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
                            <div style={{background:cardBg,borderRadius:'14px',width:'100%',maxWidth:'480px',maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
                                <div style={{padding:'16px 20px',borderBottom:`1px solid ${borderC}`,background:cardBg,borderRadius:'14px 14px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
                                    <h3 style={{fontSize:'14px',fontWeight:'700',color:textP,margin:0,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='tag' size={14} color={BRAND} />Manage Positions</h3>
                                    <button onClick={()=>setShowPosModal(false)} style={{background:'transparent',border:'none',color:textM,borderRadius:'6px',width:'26px',height:'26px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='x' size={15} color={textM} /></button>
                                </div>
                                <div style={{padding:'16px 20px',overflow:'auto',flex:1}}>
                                    <p style={{fontSize:'11px',fontWeight:'800',color:dm?'#C77DB8':'#6D2773',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px'}}>Create New Position</p>
                                    <div style={{display:'grid',gap:'12px',marginBottom:'20px'}}>
                                        <div>
                                            <label style={labelStyle}>Position Title <span style={{color:'#DC2626'}}>*</span></label>
                                            <input style={inputStyle} value={posForm.title} onChange={e=>setPosForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Community Support Worker" autoFocus/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Department</label>
                                            <select style={inputStyle} value={posForm.department_id} onChange={e=>setPosForm(f=>({...f,department_id:e.target.value}))}>
                                                <option value="">— Select —</option>
                                                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Reports To (Parent Position)</label>
                                            <select style={inputStyle} value={posForm.parent_id} onChange={e=>setPosForm(f=>({...f,parent_id:e.target.value}))}>
                                                <option value="">— Root / Top Level —</option>
                                                {positions.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={handleAddPosition} style={{padding:'9px 16px',background:BRAND,color:'white',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:'700',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Icon name='plus-circle' size={13} color='#fff' />Create Position</button>
                                    </div>

                                    <div style={{borderTop:`1px solid ${borderC}`,paddingTop:'14px'}}>
                                        <p style={{fontSize:'11px',fontWeight:'800',color:dm?'#c0cfec':'#334155',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}>
                                            Existing Positions ({positions.length}){!canDelete && <span style={{fontWeight:'500',textTransform:'none',letterSpacing:0}}> — deleting is Bootstrap Admin only</span>}
                                        </p>
                                        <div style={{border:`1.5px solid ${borderC}`,borderRadius:'8px',maxHeight:'220px',overflow:'auto'}}>
                                            {positions.length===0 ? (
                                                <p style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8',textAlign:'center',padding:'14px'}}>No positions found</p>
                                            ) : positions.map(p=>(
                                                <div key={p.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'7px 10px',borderBottom:`1px solid ${borderC}`}}>
                                                    <span style={{fontSize:'12px',color:dm?'#c0cfec':'#334155',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</span>
                                                    <span style={{fontSize:'10px',fontWeight:'600',color:posTypeColor[p.position_type]||'#833089',background:`${posTypeColor[p.position_type]||'#833089'}15`,padding:'1px 6px',borderRadius:'8px',flexShrink:0}}>{p.position_type}</span>
                                                    {!p.is_vacant && <span style={{fontSize:'10px',color:'#15803D',background:'#DCFCE7',padding:'1px 6px',borderRadius:'8px',flexShrink:0}}>Occupied</span>}
                                                    {p.is_vacant && <span style={{fontSize:'10px',color:'#DC2626',background:dm?'rgba(239,68,68,0.15)':'#FEF2F2',padding:'1px 6px',borderRadius:'8px',flexShrink:0}}>Vacant</span>}
                                                    {canDelete && (
                                                        <button type="button" title="Delete position (Bootstrap Admin Only)"
                                                            onClick={()=>{ setPosDeleteError(''); setDelPosConfirm(p); }}
                                                            style={{background:'none',border:'none',cursor:'pointer',padding:'2px',display:'flex',flexShrink:0}}>
                                                            <Icon name='trash-2' size={12} color={dm?'#fca5a5':'#DC2626'} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{padding:'12px 20px',borderTop:`1px solid ${borderC}`,display:'flex',justifyContent:'flex-end',gap:'8px',background:dm?'rgba(4,8,20,0.6)':'#F8F9FF',borderRadius:'0 0 14px 14px',flexShrink:0}}>
                                    <button onClick={()=>setShowPosModal(false)} style={{padding:'8px 16px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'12px',fontWeight:'600',color:textM,cursor:'pointer'}}>Close</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DELETE CONFIRM ───────────────────────────────────── */}
                    {delConfirm && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{background:cardBg,borderRadius:'14px',width:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}>
                                <div style={{padding:'20px 24px',textAlign:'center'}}>
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='alert-triangle' size={40} color='#EF4444' /></div>
                                    <h3 style={{fontSize:'16px',fontWeight:'700',color:textP,margin:'0 0 8px'}}>Deactivate Staff Member?</h3>
                                    <p style={{fontSize:'13px',color:textM,margin:'0 0 8px'}}>
                                        <strong>{delConfirm.name}</strong> will be deactivated and removed from all org chart positions.
                                    </p>
                                    <p style={{fontSize:'12px',color:'#DC2626',background:'#FEF2F2',padding:'8px',borderRadius:'6px',margin:'0 0 4px'}}>
                                        Their positions will become <strong>VACANT</strong> in the Org Chart.
                                    </p>
                                    <p style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8'}}>This action can be undone by re-adding the staff member.</p>
                                </div>
                                <div style={{padding:'12px 20px',borderTop:`1px solid ${dm?'rgba(109,39,115,0.10)':'#EEF2F8'}`,display:'flex',gap:'10px',justifyContent:'center',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                                    <button onClick={()=>setDelConfirm(null)} style={{padding:'9px 20px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:textP}}>Cancel</button>
                                    <button onClick={handleDelete} style={{padding:'9px 20px',background:'#DC2626',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Deactivate</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DELETE POSITION CONFIRM (Bootstrap Admin Only) ──────── */}
                    {delPosConfirm && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{background:cardBg,borderRadius:'14px',width:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}>
                                <div style={{padding:'20px 24px',textAlign:'center'}}>
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='trash-2' size={36} color='#EF4444' /></div>
                                    <h3 style={{fontSize:'16px',fontWeight:'700',color:textP,margin:'0 0 8px'}}>Delete Position?</h3>
                                    <p style={{fontSize:'13px',color:textM,margin:'0 0 12px'}}>
                                        <strong>{delPosConfirm.title}</strong> will be permanently removed from the Org Chart. This cannot be undone.
                                    </p>
                                    {posDeleteError && (
                                        <div style={{fontSize:'12px',color:'#DC2626',background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',padding:'8px',borderRadius:'6px',marginBottom:'4px',textAlign:'left',display:'flex',alignItems:'flex-start',gap:'6px'}}>
                                            <Icon name='alert-triangle' size={12} color='#DC2626' style={{flexShrink:0,marginTop:'2px'}} />{posDeleteError}
                                        </div>
                                    )}
                                </div>
                                <div style={{padding:'12px 20px',borderTop:`1px solid ${dm?'rgba(109,39,115,0.10)':'#EEF2F8'}`,display:'flex',gap:'10px',justifyContent:'center',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                                    <button onClick={()=>{setDelPosConfirm(null); setPosDeleteError('');}} style={{padding:'9px 20px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:textP}}>Cancel</button>
                                    <button onClick={handleDeletePosition} style={{padding:'9px 20px',background:'#DC2626',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Delete Position</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            );
        });

        // ── Ticket Log Page ───────────────────────────────────────────────────────
        const TicketLogPage = React.memo(function TicketLogPage() {
            const dm = useDark();
            const sessionUser = React.useMemo(() => getSessionUser(), []);

            // Palette
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'rgba(15,23,42,0.85)' : '#FFFFFF';
            const borderC = dm ? 'rgba(109,39,115,0.18)' : '#E8ECFF';
            const textP   = dm ? '#e2e8f0' : '#1e293b';
            const textM   = dm ? '#94a3b8' : '#64748B';
            const textS   = dm ? '#64748b' : '#94a3b8';

            // State
            const [tickets, setTickets]         = React.useState([]);
            const [loading, setLoading]         = React.useState(true);
            const [search, setSearch]           = React.useState('');
            const [statusFilter, setStatusFilter]     = React.useState('');
            const [priorityFilter, setPriorityFilter] = React.useState('');
            const [assigneeFilter, setAssigneeFilter] = React.useState('');
            const [dateFrom, setDateFrom]             = React.useState('');
            const [dateTo, setDateTo]                 = React.useState('');
            const [selected, setSelected]       = React.useState(null);
            const [logData, setLogData]         = React.useState(null);  // { ticket, timeline }
            const [logLoading, setLogLoading]   = React.useState(false);
            const [logError, setLogError]       = React.useState('');

            // Fetch all tickets (scope=all for admin/director, scope=dept for manager)
            React.useEffect(() => {
                const scopeP = getTicketScopeParams(sessionUser);
                const params = new URLSearchParams({ ...scopeP, all: '1', limit: '500' });
                authFetch(`${HRMS_API}/tickets?${params}`)
                    .then(r => r.json())
                    .then(d => { setTickets(d.tickets || []); setLoading(false); })
                    .catch(() => setLoading(false));
            }, []);

            // Fetch log when ticket selected
            const selectTicket = async (t) => {
                setSelected(t);
                setLogData(null);
                setLogError('');
                setLogLoading(true);
                try {
                    const data = await API.tickets.log(t._dbId || t.id);
                    setLogData(data);
                } catch (e) {
                    setLogError(e.message || 'Failed to load log');
                } finally {
                    setLogLoading(false);
                }
            };

            // Derived filter options (from loaded tickets — no extra API call)
            const uniquePriorities = React.useMemo(() => {
                const seen = new Map();
                tickets.forEach(t => { if (t.priorityLabel && !seen.has(t.priorityLabel)) seen.set(t.priorityLabel, t.priority||t.priorityLabel); });
                return [...seen.entries()].map(([label, val]) => ({ label, val }));
            }, [tickets]);

            const uniqueAssignees = React.useMemo(() => {
                const seen = new Map();
                tickets.forEach(t => { if (t.assigneeName && !seen.has(t.assigneeName)) seen.set(t.assigneeName, t.assigneeName); });
                return [...seen.keys()].sort();
            }, [tickets]);

            const hasActiveFilters = search || statusFilter || priorityFilter || assigneeFilter || dateFrom || dateTo;

            const clearFilters = () => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setAssigneeFilter('');
                setDateFrom('');
                setDateTo('');
            };

            // Filtered ticket list
            const filtered = tickets.filter(t => {
                const q = search.toLowerCase();
                const matchSearch = !q
                    || (t.title||'').toLowerCase().includes(q)
                    || (t.ticketNumber||'').toLowerCase().includes(q)
                    || (t.requesterName||'').toLowerCase().includes(q)
                    || (t.assigneeName||'').toLowerCase().includes(q);
                const matchStatus = !statusFilter
                    || (t.status||'').toLowerCase().replace(/ /g,'_') === statusFilter.toLowerCase().replace(/ /g,'_');
                const matchPriority = !priorityFilter
                    || String(t.priority||'') === String(priorityFilter)
                    || (t.priorityLabel||'').toLowerCase() === priorityFilter.toLowerCase();
                const matchAssignee = !assigneeFilter
                    || (t.assigneeName||'') === assigneeFilter;
                const createdMs = t.createdAt ? new Date(t.createdAt).getTime() : null;
                const matchFrom = !dateFrom || (createdMs && createdMs >= new Date(dateFrom).getTime());
                const matchTo   = !dateTo   || (createdMs && createdMs <= new Date(dateTo + 'T23:59:59').getTime());
                return matchSearch && matchStatus && matchPriority && matchAssignee && matchFrom && matchTo;
            });

            // Normalise raw DB status to phase key (new/waiting/assigned → open)
            const normStatus = (s) => {
                const k = (s||'').toLowerCase().replace(/ /g,'_');
                return { new:'open', waiting:'open', assigned:'open' }[k] || k;
            };
            // Status color helper
            const statusColor = (s) => {
                const m = { open:'#833089', new:'#833089', waiting:'#833089', assigned:'#0EA5E9', in_progress:'#0EA5E9', pending_approval:'#D97706', resolved:'#10B981', closed:'#64748B' };
                return m[(s||'').toLowerCase().replace(/ /g,'_')] || '#833089';
            };
            const statusBg = (s) => {
                const m = { open:'rgba(109,39,115,0.1)', new:'rgba(109,39,115,0.1)', waiting:'rgba(109,39,115,0.1)', assigned:'rgba(14,165,233,0.1)', in_progress:'rgba(14,165,233,0.1)', pending_approval:'rgba(217,119,6,0.1)', resolved:'rgba(16,185,129,0.1)', closed:'rgba(100,116,139,0.1)' };
                return m[(s||'').toLowerCase().replace(/ /g,'_')] || 'rgba(109,39,115,0.1)';
            };

            // Timeline entry config
            const entryConfig = (entry) => {
                const { type, action } = entry;
                if (type === 'approval') {
                    if ((action||'').toLowerCase() === 'approved') return { icon:'check-circle', color:'#10B981', bg:dm?'rgba(16,185,129,0.1)':'#ECFDF5', label:'Approved' };
                    if ((action||'').toLowerCase() === 'rejected') return { icon:'x-circle', color:'#EF4444', bg:dm?'rgba(239,68,68,0.1)':'#FEF2F2', label:'Rejected' };
                    return { icon:'lock-open', color:'#D97706', bg:dm?'rgba(217,119,6,0.1)':'#FFFBEB', label:'Reopened' };
                }
                if (type === 'comment') return { icon:'message-square', color:'#64748B', bg:dm?'rgba(100,116,139,0.1)':'#F8FAFC', label:'Comment' };
                const map = {
                    created:              { icon:'ticket', color:'#833089', bg:dm?'rgba(109,39,115,0.1)':'#F6ECF4', label:'Created' },
                    assigned:             { icon:'user', color:'#0EA5E9', bg:dm?'rgba(14,165,233,0.1)':'#F0F9FF', label:'Assigned' },
                    status_changed:       { icon:'refresh-cw', color:'#833089', bg:dm?'rgba(131,47,138,0.1)':'#F5F3FF', label:'Status Changed' },
                    priority_changed:     { icon:'zap', color:'#F59E0B', bg:dm?'rgba(245,158,11,0.1)':'#FFFBEB', label:'Priority Changed' },
                    approvers_updated:    { icon:'users', color:'#833089', bg:dm?'rgba(109,39,115,0.1)':'#F6ECF4', label:'Approvers Updated' },
                    extension_requested:  { icon:'calendar', color:'#D97706', bg:dm?'rgba(217,119,6,0.1)':'#FFFBEB', label:'Extension Requested' },
                    extension_responded:  { icon:'clipboard-list', color:'#0EA5E9', bg:dm?'rgba(14,165,233,0.1)':'#F0F9FF', label:'Extension Responded' },
                    reopened:             { icon:'lock-open', color:'#D97706', bg:dm?'rgba(217,119,6,0.1)':'#FFFBEB', label:'Reopened' },
                    commented:            { icon:'message-square', color:'#64748B', bg:dm?'rgba(100,116,139,0.1)':'#F8FAFC', label:'Comment' },
                    attachment_added:     { icon:'paperclip', color:'#64748B', bg:dm?'rgba(100,116,139,0.1)':'#F8FAFC', label:'Attachment Added' },
                    escalated:            { icon:'alert-octagon', color:'#EF4444', bg:dm?'rgba(239,68,68,0.1)':'#FEF2F2', label:'Escalated' },
                    'pending_approval':   { icon:'hourglass', color:'#D97706', bg:dm?'rgba(217,119,6,0.1)':'#FFFBEB', label:'Sent for Approval' },
                    // activity entries from approve/reject endpoints
                    approved:             { icon:'check-circle', color:'#10B981', bg:dm?'rgba(16,185,129,0.1)':'#ECFDF5', label:'Approved' },
                    rejected:             { icon:'x-circle', color:'#EF4444', bg:dm?'rgba(239,68,68,0.1)':'#FEF2F2', label:'Rejected' },
                };
                return map[action] || { icon:'file-edit', color:'#833089', bg:dm?'rgba(109,39,115,0.1)':'#F6ECF4', label: (action||'').replace(/_/g,' ') };
            };

            // Human-readable description of an entry
            const entryDesc = (entry) => {
                const d = entry.details || {};
                const actor = entry.actorName || 'System';
                switch (entry.action) {
                    case 'created':             return `Ticket created by ${actor}`;
                    case 'assigned':            return `Assigned to ${d.toName || d.assigneeName || d.to || 'someone'} by ${actor}`;
                    case 'status_changed':      return `Status changed: ${d.from || '—'} → ${d.to || '—'}`;
                    case 'priority_changed':    return `Priority changed: ${d.from || '—'} → ${d.to || '—'}`;
                    case 'approvers_updated':   return `Approvers updated by ${actor}`;
                    case 'extension_requested': { const due = d.newDueDate || d.newDue; return `Time extension requested by ${actor} — new due: ${due ? new Date(due).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}`; }
                    case 'extension_responded': {
                        const resp = ['approved','approve'].includes((d.action||'').toLowerCase()) ? 'approved' : 'denied';
                        return `Extension ${resp} by ${actor}`;
                    }
                    case 'closed':              return `Ticket closed by ${actor} — resolution confirmed`;
                    case 'reopened':            return `Ticket reopened by ${actor}`;
                    case 'commented':           return `Comment by ${actor}`;
                    case 'attachment_added':    return `Attachment added by ${actor}`;
                    case 'escalated':           return `Escalated by ${actor}`;
                    case 'approved':            return `Approved by ${actor}${d.acceptanceNote ? ` — "${d.acceptanceNote}"` : ''}`;
                    case 'rejected':            return `Rejected by ${actor}${d.justification ? ` — "${d.justification}"` : ''}`;
                    case 'Approved':            return `Approved by ${actor}${d.comments ? ` — "${d.comments}"` : ''}`;
                    case 'Rejected':            return `Rejected by ${actor}${d.comments ? ` — "${d.comments}"` : ''}`;
                    case 'Reopened':            return `Reopened by ${actor}${d.comments ? ` — "${d.comments}"` : ''}`;
                    default:                    return `${(entry.action||'').replace(/_/g,' ')} by ${actor}`;
                }
            };

            // Phase timeline — derive reached phases from the log
            const PHASES = [
                { key: 'created',          label: 'Created',     icon: 'ticket' },
                { key: 'open',             label: 'Open',        icon: 'inbox' },
                { key: 'in_progress',      label: 'In Progress', icon: 'loader' },
                { key: 'pending_approval', label: 'Approval',    icon: 'hourglass' },
                { key: 'resolved',         label: 'Resolved',    icon: 'check-circle' },
                { key: 'closed',           label: 'Closed',      icon: 'lock' },
            ];
            const getReachedPhases = (timeline, ticket) => {
                const reached = new Set(['created']);
                if (ticket) {
                    const s = normStatus(ticket.status);
                    if (['open','in_progress','pending_approval','resolved','closed'].includes(s)) reached.add('open');
                    if (['in_progress','pending_approval','resolved','closed'].includes(s)) reached.add('in_progress');
                    if (['pending_approval','resolved','closed'].includes(s)) reached.add('pending_approval');
                    if (['resolved','closed'].includes(s)) reached.add('resolved');
                    if (s === 'closed') reached.add('closed');
                }
                (timeline||[]).forEach(e => {
                    if (e.action === 'status_changed' && e.details?.to) {
                        const to = (e.details.to||'').toLowerCase().replace(' ','_');
                        reached.add(to);
                    }
                });
                return reached;
            };

            const fmtTime = (iso) => {
                if (!iso) return '—';
                const d = new Date(iso);
                return d.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) + ' ' +
                    d.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'});
            };
            const fmtRelative = (iso) => {
                if (!iso) return '';
                const diff = Date.now() - new Date(iso).getTime();
                const m = Math.floor(diff/60000);
                if (m < 1) return 'just now';
                if (m < 60) return `${m}m ago`;
                const h = Math.floor(m/60);
                if (h < 24) return `${h}h ago`;
                const days = Math.floor(h/24);
                if (days < 30) return `${days}d ago`;
                return new Date(iso).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
            };

            const statuses = ['Open','New','Waiting','Assigned','In Progress','Pending Approval','Resolved','Closed'];

            return (
                <main style={{flex:1,overflowY:'auto',padding:'24px',background:pageBg}}>
                    {/* Header */}
                    <div style={{marginBottom:24}}>
                        <h1 style={{fontSize:22,fontWeight:700,color:textP,margin:0,display:'flex',alignItems:'center',gap:'8px'}}><Icon name='scroll-text' size={20} color={dm?'#C77DB8':'#6D2773'} />Ticket Log</h1>
                        <p style={{fontSize:13,color:textM,marginTop:4}}>Full lifecycle audit of every ticket — phase by phase, event by event.</p>
                    </div>

                    <div style={{display:'flex',gap:16,height:'calc(100vh - 160px)'}}>
                        {/* ── Left panel: ticket list ── */}
                        <div style={{width:320,flexShrink:0,display:'flex',flexDirection:'column',gap:8}}>
                            {/* Search */}
                            <input
                                value={search} onChange={e=>setSearch(e.target.value)}
                                placeholder="Search by title, #, requester, assignee…"
                                style={{width:'100%',border:`1px solid ${borderC}`,borderRadius:10,padding:'9px 12px',
                                    fontSize:13,background:cardBg,color:textP,outline:'none',boxSizing:'border-box'}}
                            />

                            {/* Filter panel */}
                            <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:12,padding:'12px',display:'flex',flexDirection:'column',gap:8}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                    <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:textM,display:'inline-flex',alignItems:'center',gap:'4px'}}><Icon name='filter' size={11} color={textM} />Filters</span>
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters}
                                            style={{fontSize:11,color:'#833089',background:'none',border:'none',cursor:'pointer',padding:0,fontWeight:600}}>
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {/* Status */}
                                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                                    style={{width:'100%',border:`1px solid ${borderC}`,borderRadius:8,padding:'7px 10px',
                                        fontSize:12,background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:textM,outline:'none',boxSizing:'border-box'}}>
                                    <option value="">All Statuses</option>
                                    {statuses.map(s=><option key={s} value={s}>{s}</option>)}
                                </select>

                                {/* Priority */}
                                <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}
                                    style={{width:'100%',border:`1px solid ${priorityFilter?'#833089':borderC}`,borderRadius:8,padding:'7px 10px',
                                        fontSize:12,background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:textM,outline:'none',boxSizing:'border-box'}}>
                                    <option value="">All Priorities</option>
                                    {uniquePriorities.map(p=><option key={p.val} value={p.val}>{p.label}</option>)}
                                </select>

                                {/* Assignee */}
                                <select value={assigneeFilter} onChange={e=>setAssigneeFilter(e.target.value)}
                                    style={{width:'100%',border:`1px solid ${assigneeFilter?'#833089':borderC}`,borderRadius:8,padding:'7px 10px',
                                        fontSize:12,background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:textM,outline:'none',boxSizing:'border-box'}}>
                                    <option value="">All Assignees</option>
                                    {uniqueAssignees.map(a=><option key={a} value={a}>{a}</option>)}
                                </select>

                                {/* Date range */}
                                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                    <div style={{flex:1}}>
                                        <label style={{fontSize:10,color:textS,display:'block',marginBottom:3}}>From</label>
                                        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
                                            style={{width:'100%',border:`1px solid ${dateFrom?'#833089':borderC}`,borderRadius:8,padding:'6px 8px',
                                                fontSize:12,background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:textP,outline:'none',boxSizing:'border-box',
                                                colorScheme: dm?'dark':'light'}}/>
                                    </div>
                                    <div style={{flex:1}}>
                                        <label style={{fontSize:10,color:textS,display:'block',marginBottom:3}}>To</label>
                                        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
                                            style={{width:'100%',border:`1px solid ${dateTo?'#833089':borderC}`,borderRadius:8,padding:'6px 8px',
                                                fontSize:12,background:dm?'rgba(8,16,36,0.5)':'#F8FAFF',color:textP,outline:'none',boxSizing:'border-box',
                                                colorScheme: dm?'dark':'light'}}/>
                                    </div>
                                </div>
                            </div>

                            {/* Result count */}
                            <div style={{fontSize:11,color:textM,paddingLeft:2}}>
                                {loading ? 'Loading…' : `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}${hasActiveFilters ? ' matched' : ''}`}
                            </div>

                            {/* Ticket list */}
                            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:6}}>
                                {loading ? (
                                    <div style={{textAlign:'center',padding:32,color:textM,fontSize:13}}>Loading tickets…</div>
                                ) : filtered.length === 0 ? (
                                    <div style={{textAlign:'center',padding:32,color:textM,fontSize:13}}>No tickets found</div>
                                ) : filtered.map(t => {
                                    const isActive = selected && (selected._dbId||selected.id) === (t._dbId||t.id);
                                    const sc = statusColor(t.status);
                                    const sb = statusBg(t.status);
                                    return (
                                        <div key={t._dbId||t.id} onClick={()=>selectTicket(t)}
                                            style={{padding:'10px 12px',borderRadius:10,cursor:'pointer',
                                                background: isActive ? (dm?'rgba(109,39,115,0.18)':'#F6ECF4') : cardBg,
                                                border:`1px solid ${isActive ? '#833089' : borderC}`,
                                                transition:'all 0.15s'}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
                                                <span style={{fontSize:11,fontWeight:700,color:'#833089'}}>{t.ticketNumber||`TKT-${String(t._dbId||t.id).padStart(6,'0')}`}</span>
                                                <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,
                                                    background:sb,color:sc,whiteSpace:'nowrap'}}>{({'new':'New','waiting':'Waiting','assigned':'Assigned','open':'Open','in_progress':'In Progress','pending_approval':'Pending Approval','resolved':'Resolved','closed':'Closed'}[(t.status||'').toLowerCase()])||t.statusLabel||t.status||'Open'}</span>
                                            </div>
                                            <p style={{fontSize:12,fontWeight:600,color:textP,margin:'4px 0 2px',
                                                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{t.title}</p>
                                            <p style={{fontSize:11,color:textM,margin:0}}>
                                                {t.requesterName||'—'} → {t.assigneeName||'Unassigned'}
                                            </p>
                                            <p style={{fontSize:10,color:textS,margin:'2px 0 0'}}>{fmtRelative(t.createdAt)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Right panel: timeline ── */}
                        <div style={{flex:1,overflowY:'auto',background:cardBg,borderRadius:14,border:`1px solid ${borderC}`,padding:0}}>
                            {!selected ? (
                                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                                    height:'100%',gap:12,color:textM}}>
                                    <Icon name='scroll-text' size={48} color={dm?'#4a607f':'#CBD5E1'} />
                                    <p style={{fontSize:14,margin:0}}>Select a ticket to view its full log</p>
                                </div>
                            ) : logLoading ? (
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:textM,fontSize:14,gap:'8px'}}>
                                    <YCLoader size={18} /> Loading log…
                                </div>
                            ) : logError ? (
                                <div style={{padding:24,color:'#EF4444',fontSize:13}}>{logError}</div>
                            ) : logData ? (()=>{
                                const { ticket, timeline } = logData;
                                const reachedPhases = getReachedPhases(timeline, ticket);
                                const sc = statusColor(ticket.status);
                                const sb = statusBg(ticket.status);

                                return (
                                    <div>
                                        {/* Ticket header */}
                                        <div style={{padding:'20px 24px',borderBottom:`1px solid ${borderC}`}}>
                                            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:8}}>
                                                <div>
                                                    <span style={{fontSize:11,fontWeight:700,color:'#833089',marginRight:8}}>{ticket.ticketNumber||`TKT-${String(ticket._dbId||ticket.id).padStart(6,'0')}`}</span>
                                                    <span style={{fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:sb,color:sc}}>{ticket.status}</span>
                                                </div>
                                                {ticket.priorityLabel && (
                                                    <span style={{fontSize:11,color:textM,display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='zap' size={11} color={textM} />{ticket.priorityLabel}</span>
                                                )}
                                            </div>
                                            <h2 style={{fontSize:16,fontWeight:700,color:textP,margin:'0 0 6px'}}>{ticket.title}</h2>
                                            <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:11,color:textM}}>
                                                <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='user' size={11} color={textM} />Raised by: <strong>{ticket.requesterName||'—'}</strong>{ticket.requesterActive===false && <ExStaffBadge />}</span>
                                                <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='wrench' size={11} color={textM} />Assigned to: <strong>{ticket.assigneeName||'Unassigned'}</strong>{ticket.assigneeActive===false && <ExStaffBadge />}</span>
                                                {ticket.categoryLabel && <CatBadge label={ticket.categoryLabel} />}
                                                <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='calendar' size={11} color={textM} />Created: <strong>{fmtTime(ticket.createdAt)}</strong></span>
                                                {ticket.closedAt && <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='lock' size={11} color={textM} />Closed: <strong>{fmtTime(ticket.closedAt)}</strong></span>}
                                            </div>
                                        </div>

                                        {/* Phase tracker */}
                                        <div style={{padding:'16px 24px',borderBottom:`1px solid ${borderC}`,background:dm?'rgba(8,16,36,0.4)':'#F8FAFF'}}>
                                            <p style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:textM,margin:'0 0 12px'}}>Lifecycle Phases</p>
                                            <div style={{display:'flex',alignItems:'center',gap:0,flexWrap:'nowrap',overflowX:'auto'}}>
                                                {PHASES.map((ph, i) => {
                                                    const reached = reachedPhases.has(ph.key);
                                                    const isCurrent = normStatus(ticket.status) === ph.key;
                                                    return (
                                                        <React.Fragment key={ph.key}>
                                                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:70}}>
                                                                <div style={{width:34,height:34,borderRadius:'50%',display:'flex',alignItems:'center',
                                                                    justifyContent:'center',fontSize:16,
                                                                    background: isCurrent ? '#833089' : reached ? (dm?'rgba(16,185,129,0.2)':'#ECFDF5') : (dm?'rgba(255,255,255,0.05)':'#F1F5F9'),
                                                                    border: isCurrent ? '2px solid #833089' : reached ? '2px solid #10B981' : `2px solid ${borderC}`,
                                                                    boxShadow: isCurrent ? '0 0 0 3px rgba(109,39,115,0.25)' : 'none'}}>
                                                                    <Icon name={ph.icon} size={16} color={isCurrent ? '#fff' : reached ? '#10B981' : '#94a3b8'} />
                                                                </div>
                                                                <span style={{fontSize:10,fontWeight: isCurrent||reached ? 700 : 400,
                                                                    color: isCurrent ? '#833089' : reached ? '#10B981' : textS,
                                                                    whiteSpace:'nowrap'}}>{ph.label}</span>
                                                            </div>
                                                            {i < PHASES.length - 1 && (
                                                                <div style={{flex:1,height:2,minWidth:16,
                                                                    background: reachedPhases.has(PHASES[i+1].key) ? '#10B981' : (dm?'rgba(255,255,255,0.08)':'#E2E8F0'),
                                                                    margin:'0 0 20px'}}/>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Timeline entries */}
                                        <div style={{padding:'20px 24px'}}>
                                            <p style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:textM,margin:'0 0 16px'}}>
                                                Event Log — {timeline.length} event{timeline.length !== 1 ? 's' : ''}
                                            </p>
                                            {timeline.length === 0 ? (
                                                <p style={{color:textM,fontSize:13}}>No events recorded yet.</p>
                                            ) : (
                                                <div style={{position:'relative',paddingLeft:32}}>
                                                    {/* Vertical line */}
                                                    <div style={{position:'absolute',left:11,top:0,bottom:0,width:2,
                                                        background:dm?'rgba(109,39,115,0.15)':'#E8ECFF',borderRadius:2}}/>

                                                    {timeline.map((entry, idx) => {
                                                        const cfg = entryConfig(entry);
                                                        const desc = entryDesc(entry);
                                                        const d = entry.details || {};
                                                        const isLast = idx === timeline.length - 1;

                                                        return (
                                                            <div key={idx} style={{position:'relative',marginBottom: isLast?0:20}}>
                                                                {/* Dot */}
                                                                <div style={{position:'absolute',left:-32,top:3,width:24,height:24,borderRadius:'50%',
                                                                    background:cfg.bg,border:`2px solid ${cfg.color}`,
                                                                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                                    <Icon name={cfg.icon} size={13} color={cfg.color} />
                                                                </div>

                                                                {/* Card */}
                                                                <div style={{background: dm?'rgba(15,23,42,0.6)':'#FAFBFF',
                                                                    border:`1px solid ${borderC}`,borderRadius:10,padding:'10px 14px'}}>
                                                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:4}}>
                                                                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                                                                            <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,
                                                                                background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                                                                            <span style={{fontSize:12,color:textP,fontWeight:500}}>{desc}</span>
                                                                        </div>
                                                                        <span style={{fontSize:10,color:textS,whiteSpace:'nowrap',flexShrink:0}} title={fmtTime(entry.at)}>
                                                                            {fmtRelative(entry.at)}
                                                                        </span>
                                                                    </div>
                                                                    <p style={{fontSize:10,color:textS,margin:0}}>{fmtTime(entry.at)}</p>

                                                                    {/* Extra detail rows */}
                                                                    {entry.type === 'comment' && d.text && (
                                                                        <div style={{marginTop:6,padding:'6px 10px',background:dm?'rgba(255,255,255,0.03)':'#F8FAFC',
                                                                            borderRadius:7,fontSize:12,color:textM,borderLeft:`3px solid ${cfg.color}`}}>
                                                                            "{d.text}"
                                                                            {d.isInternal && <span style={{fontSize:10,color:'#D97706',marginLeft:8,display:'inline-flex',alignItems:'center',gap:'2px'}}><Icon name='lock' size={10} color='#D97706' />Internal</span>}
                                                                        </div>
                                                                    )}
                                                                    {entry.type === 'approval' && d.comments && (
                                                                        <div style={{marginTop:6,padding:'6px 10px',background:dm?'rgba(255,255,255,0.03)':'#F8FAFC',
                                                                            borderRadius:7,fontSize:12,color:textM,borderLeft:`3px solid ${cfg.color}`}}>
                                                                            "{d.comments}"
                                                                        </div>
                                                                    )}
                                                                    {entry.action === 'extension_requested' && d.note && (
                                                                        <div style={{marginTop:6,padding:'6px 10px',background:dm?'rgba(255,255,255,0.03)':'#F8FAFC',
                                                                            borderRadius:7,fontSize:12,color:textM,borderLeft:`3px solid ${cfg.color}`}}>
                                                                            Reason: "{d.note}"
                                                                        </div>
                                                                    )}
                                                                    {entry.action === 'reopened' && d.justification && (
                                                                        <div style={{marginTop:6,padding:'6px 10px',background:dm?'rgba(255,255,255,0.03)':'#F8FAFC',
                                                                            borderRadius:7,fontSize:12,color:textM,borderLeft:`3px solid ${cfg.color}`}}>
                                                                            Reason: "{d.justification}"
                                                                        </div>
                                                                    )}
                                                                    {entry.type === 'approval' && d.round > 1 && (
                                                                        <span style={{fontSize:10,color:'#D97706',marginTop:4,display:'block'}}>Round {d.round}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })() : null}
                        </div>
                    </div>
                </main>
            );
        });

        // Scheduled Reports Page
        const ScheduledReportsPage = React.memo(function ScheduledReportsPage() {
            const dm = useDark();
            const pageBg  = dm ? 'transparent' : '#F5F7FF';
            const cardBg  = dm ? 'linear-gradient(155deg,rgba(17,30,58,0.97) 0%,rgba(8,16,36,0.99) 100%)' : 'white';
            const borderC = dm ? 'rgba(109,39,115,0.16)' : '#E2E8F2';
            const textP   = dm ? '#f0f4ff' : '#0F172A';
            const textM   = dm ? '#8fa4cc' : '#64748B';
            const cu = React.useMemo(() => getSessionUser(), []);


            // ── state ──────────────────────────────────────────────────────────
            const [apiTickets,  setApiTickets]  = React.useState([]);
            const [loading,     setLoading]     = React.useState(true);
            const [exporting,   setExporting]   = React.useState(false);
            const [sending,     setSending]     = React.useState(false);
            const [toast,       setToast]       = React.useState(null);

            // filters
            const [reportType,     setReportType]     = React.useState('activity_log');
            const [period,         setPeriod]         = React.useState('all_time');
            const [dateFrom,       setDateFrom]       = React.useState('');
            const [dateTo,         setDateTo]         = React.useState('');
            const [categoryFilter, setCategoryFilter] = React.useState('all');
            const [priorityFilter, setPriorityFilter] = React.useState('all');
            const [emailTo,        setEmailTo]        = React.useState('');
            const [emailSubject,   setEmailSubject]   = React.useState('');
            // schedule modal
            const [schedules,         setSchedules]         = React.useState([]);
            const [showSchedModal,    setShowSchedModal]    = React.useState(false);
            const [schedReportType,   setSchedReportType]   = React.useState('activity_log');
            const [schedFreq,         setSchedFreq]         = React.useState('weekly');
            const [schedDay,          setSchedDay]          = React.useState('Monday');
            const [schedTime,         setSchedTime]         = React.useState('08:00');
            const [schedEmail,        setSchedEmail]        = React.useState('');
            const [schedPeriod,       setSchedPeriod]       = React.useState('last_30');
            const [schedRecipients,   setSchedRecipients]   = React.useState([]);
            const [allUsers,          setAllUsers]          = React.useState([]);

            // ── fetch tickets — same scope logic as Dashboard ──────────────────
            React.useEffect(() => {
                const su  = getSessionUser();
                const tsp = getTicketScopeParams(su);
                const tp  = new URLSearchParams({ all: '1', limit: '2000' });
                if (tsp.scope)  tp.set('scope',  tsp.scope);
                if (tsp.userId) tp.set('userId', String(tsp.userId));
                if (tsp.deptId) tp.set('deptId', String(tsp.deptId));
                authFetch(`${HRMS_API}/tickets?${tp}`)
                    .then(r => r.ok ? r.json() : {tickets:[]})
                    .then(d => setApiTickets(Array.isArray(d.tickets) ? d.tickets : []))
                    .catch(() => setApiTickets([]))
                    .finally(() => setLoading(false));
            }, []);

            // ── load schedules + users from backend ────────────────────────────
            React.useEffect(() => {
                authFetch(`${HRMS_API}/schedules`)
                    .then(r => r.ok ? r.json() : { schedules: [] })
                    .then(d => setSchedules(Array.isArray(d.schedules) ? d.schedules : []))
                    .catch(() => {});
                authFetch(`${HRMS_API}/users`)
                    .then(r => r.ok ? r.json() : { users: [] })
                    .then(d => setAllUsers(Array.isArray(d.users) ? d.users : []))
                    .catch(() => {});
            }, []);

            // ── All tickets — normalize API field names for reports ───────────
            const allTickets = React.useMemo(() => {
                // API returns lowercase status ('open','in_progress','resolved','closed').
                // Report builder checks Title Case, so normalise here once.
                const STATUS_LABELS = {
                    'open':'Open', 'new':'New', 'assigned':'Assigned',
                    'in_progress':'In Progress', 'resolved':'Resolved', 'closed':'Closed',
                    'escalated':'Escalated', 'pending_approval':'Pending Approval', 'waiting':'Waiting',
                };
                return apiTickets.map(t => ({
                    ...t,
                    _source: 'api',
                    // normalise status to Title Case
                    status: STATUS_LABELS[(t.status||'').toLowerCase()] || t.status || '',
                    // use label fields (populated by backend join), fall back to raw IDs
                    priority:       t.priorityLabel || t.priority_label || String(t.priority || ''),
                    category:       t.categoryLabel || t.category_label || t.category_name || String(t.category || ''),
                    // consistent name fields
                    assigneeName:   t.assigneeName  || t.assigned_to_name || '',
                    departmentName: t.departmentName || t.department_name  || '',
                    createdByName:  t.requesterName  || t.requester_name   || t.createdByName || '',
                }));
            }, [apiTickets]);

            // ── dynamic categories from actual data ────────────────────────────
            const dynamicCategories = React.useMemo(() => {
                const cats = new Set();
                allTickets.forEach(t => { if (t.category) cats.add(t.category); });
                return ['all', ...Array.from(cats).sort()];
            }, [allTickets]);

            // ── dynamic priorities from actual data ───────────────────────────
            const dynamicPriorities = React.useMemo(() => {
                const pri = new Set();
                allTickets.forEach(t => { if (t.priority) pri.add(t.priority); });
                // Sort by severity order if known, else alphabetically
                const order = ['critical','urgent','high','medium','low'];
                const sorted = Array.from(pri).sort((a,b) => {
                    const ai = order.indexOf((a+'').toLowerCase());
                    const bi = order.indexOf((b+'').toLowerCase());
                    if (ai === -1 && bi === -1) return (a+'').localeCompare(b+'');
                    if (ai === -1) return 1;
                    if (bi === -1) return -1;
                    return ai - bi;
                });
                return ['all', ...sorted];
            }, [allTickets]);

            const showToast = (msg, type='success') => {
                setToast({msg, type});
                setTimeout(() => setToast(null), 4000);
            };

            // ── date filter ────────────────────────────────────────────────────
            const getDateRange = () => {
                if (period === 'all_time') return { from: null, to: null };
                if (period === 'custom')   return { from: dateFrom ? new Date(dateFrom+'T00:00:00') : null, to: dateTo ? new Date(dateTo+'T23:59:59') : null };
                const now = new Date();
                const to  = new Date(now); to.setHours(23,59,59,999);
                const from = new Date(now);
                if (period === 'today')     from.setHours(0,0,0,0);
                else if (period === 'last_7')   from.setDate(from.getDate()-7);
                else if (period === 'last_30')  from.setDate(from.getDate()-30);
                else if (period === 'last_90')  from.setDate(from.getDate()-90);
                else if (period === 'last_6m')  from.setMonth(from.getMonth()-6);
                else if (period === 'last_year')from.setFullYear(from.getFullYear()-1);
                return { from, to };
            };

            const applyFilters = (tickets) => {
                const { from, to } = getDateRange();
                let result = tickets;
                // date filter
                if (from || to) {
                    result = result.filter(t => {
                        const d = new Date(t.createdAt || t.created_at || 0);
                        if (isNaN(d)) return true;
                        if (from && d < from) return false;
                        if (to   && d > to)   return false;
                        return true;
                    });
                }
                // category filter
                if (categoryFilter !== 'all') {
                    result = result.filter(t => (t.category||'').toLowerCase() === categoryFilter.toLowerCase());
                }
                // priority filter
                if (priorityFilter !== 'all') {
                    result = result.filter(t => (t.priority||'').toLowerCase() === priorityFilter.toLowerCase());
                }
                return result;
            };

            // ── report type definitions ────────────────────────────────────────
            const REPORT_GROUPS = [
                { group:'General', types:[
                    { id:'activity_log',      label:'Activity Log',         icon:'clipboard-list' },
                    { id:'open_aging',        label:'Open Tickets Aging',   icon:'clock' },
                    { id:'monthly_trend',     label:'Monthly Trend',        icon:'trending-up' },
                ]},
                { group:'Status & Priority', types:[
                    { id:'overdue_tickets',   label:'Overdue Tickets',      icon:'alert-triangle'  },
                    { id:'critical_urgent',   label:'Critical & Urgent',    icon:'alert-octagon' },
                    { id:'unassigned',        label:'Unassigned Tickets',   icon:'user' },
                    { id:'pending_approval',  label:'Pending Approval',     icon:'hourglass' },
                    { id:'escalated',         label:'Escalation Report',    icon:'arrow-up-circle'  },
                    { id:'resolved_period',   label:'Resolved This Period', icon:'check'  },
                ]},
                { group:'Performance & SLA', types:[
                    { id:'staff_performance', label:'Staff Performance',    icon:'star' },
                    { id:'sla_compliance',    label:'SLA Compliance',       icon:'check-circle' },
                    { id:'resolution_time',   label:'Resolution Time',      icon:'clock'  },
                    { id:'team_comparison',   label:'Team Comparison',      icon:'refresh-cw' },
                    { id:'priority_analysis', label:'Priority Analysis',    icon:'target' },
                ]},
                { group:'Category Reports', types:[
                    { id:'category_breakdown',label:'Category Breakdown',   icon:'folder' },
                    { id:'ndis_compliance',   label:'NDIS Compliance',      icon:'heart-handshake' },
                    { id:'client_issues',     label:'Client Issues',        icon:'users' },
                    { id:'hr_issues',         label:'HR Issues',            icon:'users-minus' },
                    { id:'safety_incidents',  label:'Safety & Incidents',   icon:'hard-hat' },
                    { id:'equipment_issues',  label:'Equipment Issues',     icon:'wrench' },
                    { id:'cleaning_quality',  label:'Cleaning Quality',     icon:'broom' },
                    { id:'account_finance',   label:'Account & Finance',    icon:'dollar-sign' },
                ]},
            ];
            // Per-group brand accent so the report-type picker reads as organised
            // and "on brand" rather than plain black-on-white — each section gets
            // its own color from the Yahwehcare palette (purple/blue/green/plum).
            const REPORT_GROUP_COLOR = {
                'General':           { accent:'#6D2773', border:'#DBC9DC', text:'#521D56' },
                'Status & Priority': { accent:'#0A6ABD', border:'#C2DAEF', text:'#07477F' },
                'Performance & SLA': { accent:'#5B892E', border:'#D6E2CB', text:'#3D5C1F' },
                'Category Reports':  { accent:'#874E8C', border:'#E1D3E2', text:'#58335B' },
            };
            const REPORT_TYPES = REPORT_GROUPS.flatMap(g => g.types);

            // ── build report rows ──────────────────────────────────────────────
            const buildReport = (overrideType) => {
                const rType = overrideType || reportType;
                const filtered = applyFilters(allTickets);
                const now = new Date();

                const isOD  = t => !['Resolved','Closed'].includes(t.status) && t.dueAt && new Date(t.dueAt) < now;
                const ageDays = t => { const d = new Date(t.createdAt||t.created_at||now); return isNaN(d)?0:Math.ceil((now-d)/86400000); };
                const resDays = t => (t.resolvedAt && (t.createdAt||t.created_at))
                    ? Math.ceil((new Date(t.resolvedAt)-new Date(t.createdAt||t.created_at))/86400000) : null;

                const baseH = ['Ticket ID','Title','Status','Priority','Category','Assignee','Department','Created Date','Due Date','Resolved Date'];
                const baseR = t => [
                    t.ticketNumber||t.id||'',
                    t.title||'',
                    t.status||'',
                    t.priority||'',
                    t.category||'',
                    t.assigneeName||t.assigned_to_name||'',
                    t.departmentName||t.department_name||'',
                    t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-AU') : '',
                    t.dueAt    ? new Date(t.dueAt).toLocaleDateString('en-AU')    : '',
                    t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString('en-AU') : '',
                ];

                if (rType === 'activity_log') {
                    return { title:'Activity Log', headers:[...baseH,'Created By','Last Updated','Age (days)'],
                        rows: filtered.map(t=>[...baseR(t), t.createdByName||t.created_by_name||'', t.updatedAt?new Date(t.updatedAt).toLocaleDateString('en-AU'):'', ageDays(t)]) };
                }
                if (rType === 'open_aging') {
                    const open = filtered.filter(t=>!['Resolved','Closed'].includes(t.status));
                    const bracket = d => d<=3?'0–3 days':d<=7?'4–7 days':d<=14?'8–14 days':d<=30?'15–30 days':'30+ days';
                    return { title:'Open Tickets Aging', headers:['Ticket ID','Title','Status','Priority','Category','Assignee','Department','Created Date','Due Date','Age (days)','Age Bracket','Overdue'],
                        rows: open.map(t=>{ const d=ageDays(t); return [t.ticketNumber||t.id||'',t.title||'',t.status||'',t.priority||'',t.category||'',t.assigneeName||t.assigned_to_name||'',t.departmentName||t.department_name||'',t.createdAt?new Date(t.createdAt).toLocaleDateString('en-AU'):'',t.dueAt?new Date(t.dueAt).toLocaleDateString('en-AU'):'',d,bracket(d),isOD(t)?'Yes':'No']; }).sort((a,b)=>b[9]-a[9]) };
                }
                if (rType === 'monthly_trend') {
                    const map = {};
                    allTickets.forEach(t=>{ const d=new Date(t.createdAt||t.created_at); if(isNaN(d))return; const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if(!map[k])map[k]={created:0,resolved:0,escalated:0,overdue:0}; map[k].created++; if(['Resolved','Closed'].includes(t.status))map[k].resolved++; if(t.isEscalated)map[k].escalated++; if(isOD(t))map[k].overdue++; });
                    return { title:'Monthly Trend', headers:['Month','Total Created','Resolved','Escalated','Overdue','Resolution Rate %'],
                        rows: Object.entries(map).sort().map(([m,v])=>[m,v.created,v.resolved,v.escalated,v.overdue,v.created>0?((v.resolved/v.created)*100).toFixed(1):'0.0']) };
                }
                if (rType === 'overdue_tickets') {
                    const od = filtered.filter(isOD);
                    return { title:'Overdue Tickets', headers:['Ticket ID','Title','Status','Priority','Category','Assignee','Department','Due Date','Days Overdue','Escalated'],
                        rows: od.map(t=>{ const days=Math.ceil((now-new Date(t.dueAt))/86400000); return [t.ticketNumber||t.id||'',t.title||'',t.status||'',t.priority||'',t.category||'',t.assigneeName||t.assigned_to_name||'',t.departmentName||t.department_name||'',new Date(t.dueAt).toLocaleDateString('en-AU'),days,t.isEscalated?'Yes':'No']; }).sort((a,b)=>b[8]-a[8]) };
                }
                if (rType === 'critical_urgent') {
                    const hi = filtered.filter(t=>['Critical','Urgent'].includes(t.priority));
                    return { title:'Critical & Urgent Tickets', headers:[...baseH,'Age (days)','Overdue','Escalated'],
                        rows: hi.map(t=>[...baseR(t),ageDays(t),isOD(t)?'Yes':'No',t.isEscalated?'Yes':'No']) };
                }
                if (rType === 'unassigned') {
                    const ua = filtered.filter(t=>!t.assigneeName&&!t.assigned_to_name&&!['Resolved','Closed'].includes(t.status));
                    return { title:'Unassigned Tickets', headers:['Ticket ID','Title','Status','Priority','Category','Department','Created Date','Due Date','Age (days)','Overdue'],
                        rows: ua.map(t=>[t.ticketNumber||t.id||'',t.title||'',t.status||'',t.priority||'',t.category||'',t.departmentName||t.department_name||'',t.createdAt?new Date(t.createdAt).toLocaleDateString('en-AU'):'',t.dueAt?new Date(t.dueAt).toLocaleDateString('en-AU'):'',ageDays(t),isOD(t)?'Yes':'No']).sort((a,b)=>b[8]-a[8]) };
                }
                if (rType === 'pending_approval') {
                    const pa = filtered.filter(t=>t.status==='Pending Approval');
                    return { title:'Pending Approval', headers:[...baseH,'Created By','Age (days)'],
                        rows: pa.map(t=>[...baseR(t),t.createdByName||t.created_by_name||'',ageDays(t)]) };
                }
                if (rType === 'escalated') {
                    const esc = filtered.filter(t=>t.isEscalated||t.status==='Escalated');
                    return { title:'Escalation Report', headers:[...baseH,'Escalated By','Escalation Reason','Age (days)'],
                        rows: esc.map(t=>[...baseR(t),t.escalatedByName||'',t.escalationReason||t.escalate_reason||'',ageDays(t)]) };
                }
                if (rType === 'resolved_period') {
                    const res = filtered.filter(t=>['Resolved','Closed'].includes(t.status));
                    return { title:'Resolved This Period', headers:[...baseH,'Created By','Resolution Days','SLA Met'],
                        rows: res.map(t=>{ const rd=resDays(t); const due=t.dueAt?new Date(t.dueAt):null; const resDate=t.resolvedAt?new Date(t.resolvedAt):null; return [...baseR(t),t.createdByName||t.created_by_name||'',rd!==null?rd:'N/A',due&&resDate?(resDate<=due?'Yes':'No'):'N/A']; }) };
                }
                if (rType === 'staff_performance') {
                    const map = {};
                    filtered.forEach(t=>{ const n=t.assigneeName||t.assigned_to_name||'Unassigned'; if(!map[n])map[n]={dept:t.departmentName||t.department_name||'',total:0,resolved:0,inprog:0,pending:0,overdue:0,totalDays:0,resCnt:0}; map[n].total++; if(['Resolved','Closed'].includes(t.status)){map[n].resolved++;const rd=resDays(t);if(rd!==null){map[n].totalDays+=rd;map[n].resCnt++;}} if(t.status==='In Progress')map[n].inprog++; if(t.status==='Pending Approval')map[n].pending++; if(isOD(t))map[n].overdue++; });
                    return { title:'Staff Performance', headers:['Staff Member','Department','Total Assigned','Resolved','In Progress','Pending','Overdue','Resolution Rate %','Avg Resolution Days'],
                        rows: Object.entries(map).sort((a,b)=>b[1].total-a[1].total).map(([n,v])=>[n,v.dept,v.total,v.resolved,v.inprog,v.pending,v.overdue,v.total>0?((v.resolved/v.total)*100).toFixed(1):'0.0',v.resCnt>0?(v.totalDays/v.resCnt).toFixed(1):'N/A']) };
                }
                if (rType === 'sla_compliance') {
                    const res = filtered.filter(t=>['Resolved','Closed'].includes(t.status));
                    return { title:'SLA Compliance', headers:['Ticket ID','Title','Category','Priority','Due Date','Resolved Date','SLA Status','Days Difference','Assignee','Department'],
                        rows: res.map(t=>{ const due=t.dueAt?new Date(t.dueAt):null; const resDate=t.resolvedAt?new Date(t.resolvedAt):null; const diff=due&&resDate?Math.ceil((resDate-due)/86400000):null; return [t.ticketNumber||t.id||'',t.title||'',t.category||'',t.priority||'',due?due.toLocaleDateString('en-AU'):'',resDate?resDate.toLocaleDateString('en-AU'):'',due&&resDate?(resDate<=due?'On Time':'Breached'):'N/A',diff!==null?diff:'N/A',t.assigneeName||t.assigned_to_name||'',t.departmentName||t.department_name||'']; }) };
                }
                if (rType === 'resolution_time') {
                    const map = {};
                    filtered.filter(t=>['Resolved','Closed'].includes(t.status)&&resDays(t)!==null).forEach(t=>{ const k=`${t.category||'Unknown'}|||${t.priority||'Unknown'}`; if(!map[k])map[k]={cat:t.category||'Unknown',pri:t.priority||'Unknown',count:0,total:0,min:9999,max:0}; const d=resDays(t); map[k].count++;map[k].total+=d;if(d<map[k].min)map[k].min=d;if(d>map[k].max)map[k].max=d; });
                    return { title:'Resolution Time Analysis', headers:['Category','Priority','Resolved Count','Avg Days','Min Days','Max Days'],
                        rows: Object.values(map).sort((a,b)=>(b.total/b.count)-(a.total/a.count)).map(v=>[v.cat,v.pri,v.count,(v.total/v.count).toFixed(1),v.min,v.max]) };
                }
                if (rType === 'team_comparison') {
                    const map = {};
                    filtered.forEach(t=>{ const d=t.departmentName||t.department_name||'Unknown'; if(!map[d])map[d]={total:0,open:0,resolved:0,escalated:0,overdue:0,pending:0,totalDays:0,resCnt:0}; map[d].total++; if(['New','Open','Assigned','In Progress'].includes(t.status))map[d].open++; if(['Resolved','Closed'].includes(t.status)){map[d].resolved++;const rd=resDays(t);if(rd!==null){map[d].totalDays+=rd;map[d].resCnt++;}} if(t.isEscalated)map[d].escalated++; if(isOD(t))map[d].overdue++; if(t.status==='Pending Approval')map[d].pending++; });
                    return { title:'Team Comparison', headers:['Department','Total','Open','Resolved','Escalated','Overdue','Pending Approval','Resolution Rate %','Avg Resolution Days'],
                        rows: Object.entries(map).sort((a,b)=>b[1].total-a[1].total).map(([d,v])=>[d,v.total,v.open,v.resolved,v.escalated,v.overdue,v.pending,v.total>0?((v.resolved/v.total)*100).toFixed(1):'0.0',v.resCnt>0?(v.totalDays/v.resCnt).toFixed(1):'N/A']) };
                }
                if (rType === 'priority_analysis') {
                    const map = {};
                    filtered.forEach(t=>{ const p=t.priority||'Unknown'; if(!map[p])map[p]={total:0,open:0,resolved:0,overdue:0,escalated:0,totalDays:0,resCnt:0}; map[p].total++; if(!['Resolved','Closed'].includes(t.status))map[p].open++; if(['Resolved','Closed'].includes(t.status)){map[p].resolved++;const rd=resDays(t);if(rd!==null){map[p].totalDays+=rd;map[p].resCnt++;}} if(isOD(t))map[p].overdue++; if(t.isEscalated)map[p].escalated++; });
                    return { title:'Priority Analysis', headers:['Priority','Total','Open','Resolved','Overdue','Escalated','Resolution Rate %','Avg Resolution Days'],
                        rows: ['Critical','Urgent','High','Medium','Low','Unknown'].filter(p=>map[p]).map(p=>{ const v=map[p]; return [p,v.total,v.open,v.resolved,v.overdue,v.escalated,v.total>0?((v.resolved/v.total)*100).toFixed(1):'0.0',v.resCnt>0?(v.totalDays/v.resCnt).toFixed(1):'N/A']; }) };
                }
                if (rType === 'category_breakdown') {
                    const map = {};
                    filtered.forEach(t=>{ const c=t.category||'Uncategorised'; if(!map[c])map[c]={total:0,open:0,resolved:0,overdue:0,escalated:0,critical:0,pending:0}; map[c].total++; if(['New','Open','Assigned','In Progress'].includes(t.status))map[c].open++; if(['Resolved','Closed'].includes(t.status))map[c].resolved++; if(isOD(t))map[c].overdue++; if(t.isEscalated)map[c].escalated++; if(['Critical','Urgent'].includes(t.priority))map[c].critical++; if(t.status==='Pending Approval')map[c].pending++; });
                    return { title:'Category Breakdown', headers:['Category','Total','Open','Resolved','Overdue','Escalated','Critical/Urgent','Pending Approval','Resolution Rate %'],
                        rows: Object.entries(map).sort((a,b)=>b[1].total-a[1].total).map(([c,v])=>[c,v.total,v.open,v.resolved,v.overdue,v.escalated,v.critical,v.pending,v.total>0?((v.resolved/v.total)*100).toFixed(1):'0.0']) };
                }
                // Category-specific reports
                const CAT_MATCH = {
                    ndis_compliance:  { label:'NDIS Compliance',    fn: t=>(t.category||'').toLowerCase().includes('ndis') },
                    client_issues:    { label:'Client Issues',      fn: t=>(t.category||'').toLowerCase().includes('client') },
                    hr_issues:        { label:'HR Issues',          fn: t=>(t.category||'').toLowerCase().includes('hr') },
                    safety_incidents: { label:'Safety & Incidents', fn: t=>(t.category||'').toLowerCase().includes('safety')||(t.category||'').toLowerCase().includes('incident') },
                    equipment_issues: { label:'Equipment Issues',   fn: t=>(t.category||'').toLowerCase().includes('equipment') },
                    cleaning_quality: { label:'Cleaning Quality',   fn: t=>(t.category||'').toLowerCase().includes('cleaning') },
                    account_finance:  { label:'Account & Finance',  fn: t=>(t.category||'').toLowerCase().includes('account')||(t.category||'').toLowerCase().includes('financ')||(t.category||'').toLowerCase().includes('billing') },
                };
                if (CAT_MATCH[rType]) {
                    const { label, fn } = CAT_MATCH[rType];
                    const subset = filtered.filter(fn);
                    return { title: label, headers:[...baseH,'Created By','Age (days)','Overdue','SLA Met'],
                        rows: subset.map(t=>{ const due=t.dueAt?new Date(t.dueAt):null; const resDate=t.resolvedAt?new Date(t.resolvedAt):null; return [...baseR(t),t.createdByName||t.created_by_name||'',ageDays(t),isOD(t)?'Yes':'No',due&&resDate?(resDate<=due?'Yes':'No'):'N/A']; }) };
                }
                return { title:'Report', headers:[], rows:[] };
            };

            // ── live preview ───────────────────────────────────────────────────
            const preview = React.useMemo(() => buildReport(), [allTickets, reportType, period, dateFrom, dateTo, categoryFilter, priorityFilter]);

            // ── XLSX export — SheetJS is lazy-loaded on first export click ────────
            const handleExportXLSX = async () => {
                // Load SheetJS dynamically only when export is actually triggered
                if (typeof XLSX === 'undefined' && !window.XLSX) {
                    try {
                        await new Promise((resolve, reject) => {
                            const s = document.createElement('script');
                            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                            s.onload = resolve; s.onerror = reject;
                            document.head.appendChild(s);
                        });
                    } catch(e) {
                        showToast('Could not load export library — check your connection.', 'error');
                        return;
                    }
                }
                const XL = (typeof XLSX !== 'undefined' ? XLSX : null) || window.XLSX || null;
                if (!XL) { showToast('SheetJS library not ready — please try again.', 'error'); return; }
                setExporting(true);
                try {
                    const { title, headers, rows } = buildReport();
                    if (!rows.length) { showToast('No records found — try "All Time" or a wider date range.', 'error'); setExporting(false); return; }
                    const wb = XL.utils.book_new();
                    const ws = XL.utils.aoa_to_sheet([headers, ...rows]);
                    ws['!cols'] = headers.map(h => ({ wch: Math.max(String(h).length + 4, 14) }));
                    XL.utils.book_append_sheet(wb, ws, title.substring(0,31));
                    const sumWs = XL.utils.aoa_to_sheet([
                        ['Report:',        title],
                        ['Period:',        period === 'custom' ? `${dateFrom} to ${dateTo}` : period.replace(/_/g,' ')],
                        ['Category:',      categoryFilter === 'all' ? 'All Categories' : categoryFilter],
                        ['Priority:',      priorityFilter === 'all' ? 'All Priorities' : priorityFilter],
                        ['Generated:',     new Date().toLocaleString('en-AU')],
                        ['Generated By:',  cu ? cu.name : 'System'],
                        ['Total Records:', rows.length],
                    ]);
                    sumWs['!cols'] = [{wch:18},{wch:40}];
                    XL.utils.book_append_sheet(wb, sumWs, 'Summary');
                    const fileName = `${title.replace(/[\s/]+/g,'_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
                    XL.writeFile(wb, fileName);
                    showToast(`${fileName} downloaded — ${rows.length} records`);
                } catch(e) {
                    showToast('Export failed: ' + e.message, 'error');
                } finally {
                    setExporting(false);
                }
            };

            // ── CSV export ─────────────────────────────────────────────────────
            const handleExportCSV = () => {
                const { title, headers, rows } = buildReport();
                if (!rows.length) { showToast('No records found — try "All Time" or a wider date range.', 'error'); return; }
                const esc = v => { const s = String(v ?? ''); return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s; };
                const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
                const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
                const url  = URL.createObjectURL(blob);
                const a    = Object.assign(document.createElement('a'), { href: url, download: `${title.replace(/[\s/]+/g,'_')}_${new Date().toISOString().slice(0,10)}.csv` });
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast(`CSV downloaded — ${rows.length} records`);
            };

            // ── Send via Resend email API ──────────────────────────────────────
            const handleSendEmail = async () => {
                if (!emailTo.trim()) { showToast('Enter at least one recipient email.', 'error'); return; }
                setSending(true);
                try {
                    const { title, headers, rows } = buildReport();
                    const subject = emailSubject || `${title} — ${new Date().toLocaleDateString('en-AU')}`;
                    const reportPayload = JSON.stringify({
                        to: emailTo.split(',').map(e=>e.trim()).filter(Boolean),
                        subject, reportTitle: title, period: period.replace(/_/g,' '),
                        generatedBy: cu?.name || 'System', headers, rows,
                    });
                    const res = await authFetch(`${HRMS_API}/notifications/send-report-email`, {
                        method: 'POST', body: reportPayload,
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error || 'Send failed'); }
                    const data = await res.json();
                    showToast(`Report emailed to ${data.recipients?.join(', ')} (${data.count} records)`);
                } catch(e) { showToast('Send failed: ' + e.message, 'error'); }
                finally { setSending(false); }
            };

            // ── Export & Send ──────────────────────────────────────────────────
            const handleExportAndSend = async () => {
                await handleExportXLSX();
                await handleSendEmail();
            };

            // ── Save schedule ──────────────────────────────────────────────────
            const handleSaveSchedule = async () => {
                if (!schedRecipients.length) { showToast('Select at least one recipient.', 'error'); return; }
                const label = REPORT_TYPES.find(r=>r.id===schedReportType)?.label || schedReportType;
                const freq = schedFreq === 'fortnightly' ? 'weekly' : schedFreq;
                const body = { name: label, description: schedPeriod, frequency: freq,
                    day_of_week: (schedFreq==='weekly'||schedFreq==='fortnightly') ? schedDay : undefined,
                    time: schedTime, report_types: [schedReportType], recipient_ids: schedRecipients.map(Number) };
                try {
                    const r = await authFetch(`${HRMS_API}/schedules`, { method:'POST', body:JSON.stringify(body) });
                    const data = await r.json();
                    if (!r.ok) { showToast(data.message || 'Failed to save schedule.', 'error'); return; }
                    setSchedules(prev => [data.schedule, ...prev]);
                    setShowSchedModal(false); setSchedRecipients([]);
                    showToast(`Schedule saved — ${label} ${schedFreq}`);
                } catch(e) { showToast('Error saving schedule.', 'error'); }
            };

            const deleteSchedule = async id => { const r=await authFetch(`${HRMS_API}/schedules/${id}`,{method:'DELETE'}); if(r.ok) setSchedules(p=>p.filter(s=>s.id!==id)); else showToast('Failed to delete schedule.','error'); };
            const toggleSchedule = async id => { const sc=schedules.find(s=>s.id===id); if(!sc) return; const r=await authFetch(`${HRMS_API}/schedules/${id}`,{method:'PATCH',body:JSON.stringify({active:!sc.active})}); if(r.ok){const d=await r.json();setSchedules(p=>p.map(s=>s.id===id?d.schedule:s));} else showToast('Failed to update schedule.','error'); };
            const sendScheduleNow = async id => { const r=await authFetch(`${HRMS_API}/schedules/${id}/send`,{method:'POST'}); const d=await r.json(); if(r.ok){setSchedules(p=>p.map(s=>s.id===id?d.schedule:s));showToast(`Report sent to ${d.emailsSent} recipient(s)`);} else showToast(d.message||'Failed to send report.','error'); };

            // ── UI helpers ─────────────────────────────────────────────────────
            const PERIOD_OPTS = [
                {v:'all_time',  l:'All Time (no filter)'},
                {v:'today',     l:'Today'},
                {v:'last_7',    l:'Last 7 days'},
                {v:'last_30',   l:'Last 30 days'},
                {v:'last_90',   l:'Last 90 days'},
                {v:'last_6m',   l:'Last 6 months'},
                {v:'last_year', l:'Last 12 months'},
                {v:'custom',    l:'Custom date range'},
            ];
            const PRIORITY_OPTS = ['all','Critical','Urgent','High','Medium','Low'];
            const FREQ_OPTS = ['daily','weekly','fortnightly','monthly'];
            const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

            const s = {
                card:    {background:cardBg, borderRadius:12, border:`1px solid ${borderC}`, padding:'20px', boxShadow:'0 1px 2px rgba(15,23,42,0.04),0 4px 12px rgba(15,23,42,0.06),0  0 0 1px rgba(15,23,42,0.03)'},
                lbl:     {display:'block', fontSize:11, fontWeight:700, color:textM, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em'},
                inp:     {width:'100%', border:`1px solid ${dm?'rgba(109,39,115,0.18)':'#CBD5E1'}`, borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box', color:textP, background:dm?'rgba(2,8,23,0.9)':'#FFFFFF'},
                sel:     {width:'100%', border:`1px solid ${dm?'rgba(109,39,115,0.18)':'#CBD5E1'}`, borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box', color:textP, background:cardBg, cursor:'pointer'},
                btnPri:  {padding:'10px 18px', background:'#6D2773', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6},
                btnGrn:  {padding:'10px 18px', background:'#059669', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6},
                btnOut:  {padding:'10px 18px', background:cardBg, color:dm?'#c0cfec':'#334155', border:`1px solid ${dm?'rgba(109,39,115,0.18)':'#CBD5E1'}`, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6},
            };

            if (loading) return (
                <main style={{flex:1,overflow:'auto',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <SectionLoader message="Loading report data…" size={40} />
                </main>
            );

            return (
                <main style={{flex:1,overflow:'auto',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                    {/* Toast */}
                    {toast && (
                        <div style={{position:'fixed',top:68,right:20,zIndex:999,background:toast.type==='error'?'#FEF2F2':'#F0FDF4',border:`1px solid ${toast.type==='error'?'#FECACA':'#BBF7D0'}`,color:toast.type==='error'?'#DC2626':'#166534',padding:'11px 18px',borderRadius:10,fontSize:13,fontWeight:600,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',maxWidth:400,display:'flex',alignItems:'center',gap:8}}>
                            <Icon name={toast.type==='error'?'alert-triangle':'check-circle'} size={14} color={toast.type==='error'?'#DC2626':'#166534'} />
                            {toast.msg}
                        </div>
                    )}

                    <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
                        {/* Page header */}
                        <div style={{marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                            <div>
                                <h1 style={{fontSize:22,fontWeight:800,color:textP,marginBottom:2,display:'flex',alignItems:'center',gap:'8px'}}><Icon name='bar-chart' size={20} color={dm?'#C77DB8':'#6D2773'} />Reports</h1>
                                <p style={{fontSize:13,color:textM}}>
                                    {loading ? 'Loading...' : `${allTickets.length} tickets from live data`}
                                </p>
                            </div>
                        </div>

                        {/* ── Filters row ── */}
                        <div style={{...s.card, marginBottom:16}}>
                            <p style={{fontSize:12,fontWeight:700,color:dm?'#c0cfec':'#334155',marginBottom:12,display:'flex',alignItems:'center',gap:'5px'}}><Icon name='filter' size={12} color={dm?'#c0cfec':'#334155'} />Filters — applied to all exports</p>
                            <div style={{display:'grid',gridTemplateColumns:period==='custom'?'2fr 1fr 1fr 1fr 1fr':'2fr 1fr 1fr',gap:12,alignItems:'end'}}>
                                {/* Period */}
                                <div>
                                    <span style={s.lbl}>Time Period</span>
                                    <select value={period} onChange={e=>{setPeriod(e.target.value);if(e.target.value!=='custom'){setDateFrom('');setDateTo('');}}} style={s.sel}>
                                        {PERIOD_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                                    </select>
                                </div>
                                {/* Date From / To — only when custom */}
                                {period==='custom'&&<div>
                                    <span style={s.lbl}>From Date</span>
                                    <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={s.inp}/>
                                </div>}
                                {period==='custom'&&<div>
                                    <span style={s.lbl}>To Date</span>
                                    <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={s.inp}/>
                                </div>}
                                {/* Category */}
                                <div>
                                    <span style={s.lbl}>Category</span>
                                    <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={s.sel}>
                                        {dynamicCategories.map(c=><option key={c} value={c}>{c==='all'?'All Categories':c}</option>)}
                                    </select>
                                </div>
                                {/* Priority */}
                                <div>
                                    <span style={s.lbl}>Priority</span>
                                    <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} style={s.sel}>
                                        {dynamicPriorities.map(p=><option key={p} value={p}>{p==='all'?'All Priorities':p}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Active filter chips */}
                            <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
                                {period!=='all_time'&&<span style={{fontSize:11,background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:'#6D2773',padding:'3px 10px',borderRadius:20,fontWeight:600,display:'inline-flex',alignItems:'center',gap:4}}><Icon name='calendar' size={11} color='#6D2773' />{PERIOD_OPTS.find(o=>o.v===period)?.l||period}</span>}
                                {categoryFilter!=='all'&&<span style={{fontSize:11,background:'#F0FDF4',color:'#166534',padding:'3px 10px',borderRadius:20,fontWeight:600,display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='folder' size={11} color='#166534' />{categoryFilter}</span>}
                                {priorityFilter!=='all'&&<span style={{fontSize:11,background:dm?'rgba(249,115,22,0.15)':'#FFF7ED',color:dm?'#fdba74':'#C2410C',padding:'3px 10px',borderRadius:20,fontWeight:600,display:'inline-flex',alignItems:'center',gap:'3px'}}><Icon name='target' size={11} color={dm?'#fdba74':'#C2410C'} />{priorityFilter}</span>}
                                <span style={{fontSize:11,background:dm?'rgba(4,8,20,0.6)':'#F8FAFF',color:textM,padding:'3px 10px',borderRadius:20,fontWeight:600}}>{preview.rows.length} records match</span>
                            </div>
                        </div>

                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                            {/* ── LEFT: Report type selector ── */}
                            <div style={s.card}>
                                <p style={{fontSize:13,fontWeight:700,color:textP,marginBottom:14,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='clipboard-list' size={14} color={textP} />Report Type</p>
                                <div style={{display:'flex',flexDirection:'column',gap:12,maxHeight:480,overflowY:'auto',paddingRight:4}}>
                                    {REPORT_GROUPS.map(g=>{
                                        const gc = REPORT_GROUP_COLOR[g.group] || REPORT_GROUP_COLOR['General'];
                                        return (
                                        <div key={g.group}>
                                            <p style={{fontSize:10,fontWeight:700,color:gc.accent,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>{g.group}</p>
                                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                                                {g.types.map(r=>{
                                                    const sel = reportType===r.id;
                                                    return (
                                                    <button key={r.id} onClick={()=>setReportType(r.id)} style={{padding:'8px 10px',borderRadius:8,border:`2px solid ${sel?gc.accent:gc.border}`,background:sel?gc.accent:(dm?'rgba(255,255,255,0.03)':'white'),cursor:'pointer',textAlign:'left',transition:'all 0.12s'}}>
                                                        <Icon name={r.icon} size={13} color={sel?'#fff':gc.accent} />
                                                        <span style={{display:'block',fontSize:11,fontWeight:700,color:sel?'#fff':gc.text,marginTop:2,lineHeight:1.3}}>{r.label}</span>
                                                    </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── RIGHT: Export + Email ── */}
                            <div style={{display:'flex',flexDirection:'column',gap:14}}>
                                {/* Selected report info */}
                                <div style={{...s.card,background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',border:'2px solid #E3BFDA'}}>
                                    <p style={{fontSize:13,fontWeight:700,color:'#5D2162'}}>
                                        {REPORT_TYPES.find(r=>r.id===reportType)?.label}
                                    </p>
                                    <p style={{fontSize:22,fontWeight:800,color:textP,marginTop:4}}>{preview.rows.length} <span style={{fontSize:13,fontWeight:500,color:textM}}>records ready to export</span></p>
                                    {preview.rows.length===0&&<p style={{fontSize:12,color:'#DC2626',marginTop:4,display:'flex',alignItems:'center',gap:'4px'}}><Icon name='alert-triangle' size={12} color='#DC2626' />No records match — try "All Time" or adjust your filters</p>}
                                </div>

                                {/* Export Only */}
                                <div style={s.card}>
                                    <p style={{fontSize:13,fontWeight:700,color:textP,marginBottom:12,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='download' size={14} color={textP} />Export</p>
                                    <div style={{display:'flex',gap:10}}>
                                        <button onClick={handleExportXLSX} disabled={exporting} style={{...s.btnPri,flex:1,opacity:exporting?0.6:1}}>
                                            <Icon name='bar-chart' size={14} color='#fff' />{exporting?'Exporting…':'Excel (.xlsx)'}
                                        </button>
                                        <button onClick={handleExportCSV} style={{...s.btnPri,flex:1}}>
                                            <Icon name='scroll-text' size={14} color='#fff' />CSV (.csv)
                                        </button>
                                    </div>
                                </div>

                                {/* Email */}
                                <div style={s.card}>
                                    <p style={{fontSize:13,fontWeight:700,color:textP,marginBottom:12,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='mail' size={14} color={textP} />Email Report</p>
                                    <div style={{marginBottom:10}}>
                                        <span style={s.lbl}>Recipient(s)</span>
                                        <input type="text" value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder="email@company.com, another@co.com" style={s.inp}/>
                                    </div>
                                    <div style={{marginBottom:12}}>
                                        <span style={s.lbl}>Subject (optional)</span>
                                        <input type="text" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} placeholder={`${REPORT_TYPES.find(r=>r.id===reportType)?.label} — ${new Date().toLocaleDateString('en-AU')}`} style={s.inp}/>
                                    </div>
                                    <div style={{display:'flex',gap:8}}>
                                        <button onClick={handleSendEmail} disabled={sending||!emailTo.trim()} style={{...s.btnPri,background:'#5B892E',flex:1,opacity:(sending||!emailTo.trim())?0.6:1}}>
                                            <Icon name='send' size={14} color='#fff' />{sending?'Sending…':'Send Report'}
                                        </button>
                                        <button onClick={handleExportAndSend} disabled={exporting||sending||!emailTo.trim()} style={{...s.btnPri,background:'#5B892E',flex:1,opacity:(exporting||sending||!emailTo.trim())?0.6:1}}>
                                            <Icon name='zap' size={14} color='#fff' />Export & Send
                                        </button>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div style={s.card}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                                        <p style={{fontSize:13,fontWeight:700,color:textP,display:'flex',alignItems:'center',gap:'6px'}}><Icon name='clock' size={14} color={textP} />Schedules</p>
                                        <button onClick={()=>{ setSchedReportType(reportType); setShowSchedModal(true); }} style={{...s.btnPri,padding:'6px 12px',fontSize:12}}>+ Add</button>
                                    </div>
                                    {schedules.length===0?(
                                        <p style={{fontSize:12,color:dm?'#4a607f':'#94A3B8',textAlign:'center',padding:'12px 0'}}>No schedules yet — click + Add</p>
                                    ):(
                                        <div style={{display:'flex',flexDirection:'column',gap:7,maxHeight:200,overflowY:'auto'}}>
                                            {schedules.map(sc=>(
                                                <div key={sc.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,background:sc.active?'#F0FDF4':'#F9FAFB',border:`1px solid ${sc.active?'#BBF7D0':'#E5E7EB'}`}}>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <p style={{fontSize:12,fontWeight:600,color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sc.name}</p>
                                                        <p style={{fontSize:11,color:textM}}>{sc.frequency==='daily'?'Daily':`Every ${sc.dayOfWeek}`} at {sc.time}{sc.lastSentAt?` · Sent ${new Date(sc.lastSentAt).toLocaleDateString('en-AU')}`:''}</p>
                                                    </div>
                                                    <button onClick={()=>sendScheduleNow(sc.id)} title="Send now" style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:dm?'rgba(109,39,115,0.15)':'#F6ECF4',color:dm?'#DDA8D1':'#6D2773'}}>▶</button>
                                                    <button onClick={()=>toggleSchedule(sc.id)} style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:sc.active?'#DCFCE7':(dm?'rgba(109,39,115,0.08)':'#EEF2F8'),color:sc.active?'#166534':(dm?'#8fa4cc':'#64748B')}}>{sc.active?'Active':'Paused'}</button>
                                                    <button onClick={()=>deleteSchedule(sc.id)} style={{width:24,height:24,borderRadius:5,border:'none',cursor:'pointer',background:'#FEF2F2',color:'#DC2626',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='trash-2' size={12} color='#DC2626' /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── Schedule Modal ── */}
                    {showSchedModal&&(
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setShowSchedModal(false);setSchedRecipients([]);}}>
                            <div style={{background:cardBg,borderRadius:16,padding:28,width:480,maxWidth:'92vw',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
                                <h3 style={{fontSize:16,fontWeight:700,color:textP,marginBottom:20,display:'flex',alignItems:'center',gap:'7px'}}><Icon name='clock' size={16} color={textP} />Schedule a Report</h3>

                                <div style={{marginBottom:14}}>
                                    <span style={s.lbl}>Report Type</span>
                                    <select value={schedReportType} onChange={e=>setSchedReportType(e.target.value)} style={s.sel}>
                                        {REPORT_GROUPS.map(g=>(
                                            <optgroup key={g.group} label={g.group}>
                                                {g.types.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div style={{marginBottom:14}}>
                                    <span style={s.lbl}>Report Period</span>
                                    <select value={schedPeriod} onChange={e=>setSchedPeriod(e.target.value)} style={s.sel}>
                                        {PERIOD_OPTS.filter(o=>o.v!=='custom').map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                                    </select>
                                </div>

                                <div style={{marginBottom:14}}>
                                    <span style={s.lbl}>Frequency</span>
                                    <div style={{display:'flex',gap:8}}>
                                        {FREQ_OPTS.map(f=>(
                                            <button key={f} onClick={()=>setSchedFreq(f)} style={{flex:1,padding:'8px',borderRadius:8,border:`2px solid ${schedFreq===f?'#6D2773':'#E5E7EB'}`,background:schedFreq===f?'#F6ECF4':(dm?'rgba(2,8,23,0.85)':'white'),cursor:'pointer',fontSize:12,fontWeight:700,color:schedFreq===f?'#6D2773':(dm?'#c0cfec':'#334155'),textTransform:'capitalize'}}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(schedFreq==='weekly'||schedFreq==='fortnightly')&&(
                                    <div style={{marginBottom:14}}>
                                        <span style={s.lbl}>Day of Week</span>
                                        <select value={schedDay} onChange={e=>setSchedDay(e.target.value)} style={s.sel}>
                                            {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div style={{marginBottom:14}}>
                                    <span style={s.lbl}>Send Time</span>
                                    <input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)} style={s.inp}/>
                                </div>

                                <div style={{marginBottom:20}}>
                                    <span style={s.lbl}>Send To (select recipients)</span>
                                    <select multiple value={schedRecipients} onChange={e=>setSchedRecipients(Array.from(e.target.selectedOptions,o=>o.value))} style={{...s.inp,height:84,padding:4}}>
                                        {allUsers.map(u=><option key={u.id} value={String(u.id)}>{u.display_name||u.name||u.email}</option>)}
                                    </select>
                                    <p style={{fontSize:11,color:textM,marginTop:4}}>Hold Ctrl / ⌘ to select multiple</p>
                                </div>

                                <div style={{display:'flex',gap:10}}>
                                    <button onClick={handleSaveSchedule} style={{...s.btnPri,flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Icon name='check-circle' size={14} color='#fff' />Save Schedule</button>
                                    <button onClick={()=>{setShowSchedModal(false);setSchedRecipients([]);}} style={{...s.btnOut,flex:1}}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            );
        });
        // ── Email Config Page (Bootstrap Admin only) ──────────────────────────────
        // ── SettingsPage — "My Profile": view own details, edit phone + address only ──
        const SettingsPage = React.memo(function SettingsPage() {
            const dm = React.useContext(DarkModeContext);
            const [profile, setProfile]   = React.useState(null);
            const [loading, setLoading]   = React.useState(true);
            const [saving, setSaving]     = React.useState(false);
            const [loadError, setLoadError] = React.useState('');
            const [toastMsg, setToastMsg] = React.useState('');
            const [phone, setPhone]       = React.useState('');
            const [address, setAddress]   = React.useState('');

            const bg    = dm ? '#0F172A' : '#F9FAFB';
            const card  = dm ? '#1E293B' : '#FFFFFF';
            const bdr   = dm ? '#334155' : '#E2E8F0';
            const txt   = dm ? '#E2E8F0' : '#1E293B';
            const muted = dm ? '#94A3B8' : '#6B7280';

            const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500); };

            const load = React.useCallback(async () => {
                setLoading(true); setLoadError('');
                try {
                    const d = await API.users.me.get();
                    setProfile(d.user);
                    setPhone(d.user?.phone || '');
                    setAddress(d.user?.address || '');
                } catch (e) { setLoadError(e.message); }
                finally { setLoading(false); }
            }, []);

            React.useEffect(() => { load(); }, [load]);

            const dirty = profile && (phone !== (profile.phone || '') || address !== (profile.address || ''));

            const handleSave = async () => {
                setSaving(true);
                try {
                    const d = await API.users.me.update({ phone: phone.trim(), address: address.trim() });
                    setProfile(p => ({ ...p, ...d.user }));
                    showToast('Profile updated');
                } catch (e) { showToast('Failed to save: ' + e.message); }
                finally { setSaving(false); }
            };

            const handlePhotoChange = async (dataUrl) => {
                try {
                    const d = await API.users.me.update({ profile_photo_url: dataUrl });
                    setProfile(p => ({ ...p, ...d.user }));
                    try { window.dispatchEvent(new CustomEvent('yc:profile-updated', { detail: { profile_photo_url: d.user?.profile_photo_url ?? dataUrl } })); } catch(e) {}
                    showToast('Profile photo updated');
                } catch (e) { showToast('Failed to update photo: ' + e.message); }
            };

            const initials = (profile?.name || '').split(/\s+/).map(w => w[0] || '').slice(0, 2).join('').toUpperCase();

            const fieldRow = (label, value) => (
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${bdr}`}}>
                    <span style={{fontSize:12, color:muted, fontWeight:600}}>{label}</span>
                    <span style={{fontSize:13, color:txt, fontWeight:500}}>{value || '—'}</span>
                </div>
            );

            return (
                <main style={{flex:1, overflowY:'auto', background:bg, padding:'24px'}}>
                    {toastMsg && (
                        <div style={{position:'fixed',top:20,right:20,background:'#1E293B',color:'#fff',padding:'10px 18px',borderRadius:10,zIndex:9999,fontSize:13,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
                            {toastMsg}
                        </div>
                    )}
                    <div style={{maxWidth:640, margin:'0 auto'}}>
                        <div style={{marginBottom:24}}>
                            <h1 style={{fontSize:22,fontWeight:800,color:txt,margin:0,display:'flex',alignItems:'center',gap:'8px'}}><Icon name='settings' size={22} color={txt} />My Profile</h1>
                            <p style={{fontSize:13,color:muted,margin:'4px 0 0'}}>View your account details. You can update your phone number and address below.</p>
                        </div>

                        {loading && (
                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:32,textAlign:'center',color:muted}}>Loading profile…</div>
                        )}

                        {!loading && loadError && (
                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:32,textAlign:'center'}}>
                                <p style={{color:'#EF4444',fontSize:13,marginBottom:12}}>{loadError}</p>
                                <button onClick={load} style={{padding:'8px 18px',borderRadius:8,border:`1px solid ${bdr}`,background:'transparent',color:txt,cursor:'pointer',fontSize:13}}>Retry</button>
                            </div>
                        )}

                        {!loading && !loadError && profile && (
                            <>
                                <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:20,marginBottom:20,display:'flex',alignItems:'center',gap:14}}>
                                    <AvatarUpload
                                        name={profile.name}
                                        photoUrl={profile.profile_photo_url}
                                        size={52}
                                        onPhotoChange={handlePhotoChange}
                                        onError={(msg)=>showToast(msg)}
                                    />
                                    <div>
                                        <p style={{fontSize:16,fontWeight:700,color:txt,margin:0}}>{profile.name}</p>
                                        <p style={{fontSize:12,color:muted,margin:'2px 0 0'}}>{profile.email}</p>
                                        {profile.is_bootstrap_admin && (
                                            <span style={{display:'inline-flex',alignItems:'stretch',borderRadius:6,overflow:'hidden',fontSize:'9px',fontWeight:700,marginTop:5,border:`1px solid ${dm?'rgba(109,39,115,0.35)':'#DBC9DC'}`}}>
                                                <span style={{background:'#6D2773',color:'#fff',padding:'2px 5px',display:'flex',alignItems:'center'}}><Icon name='star' size={9} color='#fff' /></span>
                                                <span style={{background:dm?'rgba(109,39,115,0.16)':'#F0E9F1',color:dm?'#A073A4':'#521D56',padding:'2px 7px'}}>Bootstrap Admin</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:'4px 20px',marginBottom:20}}>
                                    {fieldRow('Department', profile.department_name)}
                                    {fieldRow('Position', Array.isArray(profile.positions) && profile.positions.length ? profile.positions.join(', ') : profile.designation)}
                                    {fieldRow('Employment Type', profile.employment_type ? profile.employment_type.replace(/_/g,' ') : null)}
                                    <div style={{padding:'10px 0'}}>
                                        <span style={{fontSize:12, color:muted, fontWeight:600}}>Role, department, and position are managed by your administrator.</span>
                                    </div>
                                </div>

                                <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:20}}>
                                    <p style={{fontSize:13,fontWeight:700,color:txt,margin:'0 0 14px'}}>Contact Details</p>

                                    <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:muted,marginBottom:6}}>
                                        <Icon name='phone' size={13} color={muted} />Phone Number
                                    </label>
                                    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="e.g. 0400 000 000"
                                        style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:13,boxSizing:'border-box',marginBottom:16}}/>

                                    <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:muted,marginBottom:6}}>
                                        <Icon name='map-pin' size={13} color={muted} />Address
                                    </label>
                                    <textarea rows="3" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street, suburb, state, postcode"
                                        style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:13,boxSizing:'border-box',resize:'vertical',fontFamily:'inherit',marginBottom:16}}/>

                                    <button onClick={handleSave} disabled={saving || !dirty}
                                        style={{padding:'10px 22px',borderRadius:8,border:'none',background:(saving||!dirty)?'#94A3B8':'#6D2773',color:'#fff',fontWeight:600,cursor:(saving||!dirty)?'not-allowed':'pointer',fontSize:13,display:'inline-flex',alignItems:'center',gap:'6px'}}>
                                        {saving ? <><YCLoader size={13} />Saving…</> : <><Icon name='check-circle' size={14} color='#fff' />Save Changes</>}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            );
        });

        const EmailConfigPage = React.memo(function EmailConfigPage() {
            const dm = React.useContext(DarkModeContext);
            const BACKEND = window.location.hostname === 'localhost' ? 'http://localhost:4001' : 'https://yahweahcare-tkt-mgmt-hx48.vercel.app';

            const [tab, setTab]           = React.useState('logs');       // logs | queue | stats
            const [logs, setLogs]         = React.useState([]);
            const [queue, setQueue]       = React.useState([]);
            const [stats, setStats]       = React.useState(null);
            const [loading, setLoading]   = React.useState(false);
            const [toastMsg, setToastMsg] = React.useState('');
            const [testEmail, setTestEmail] = React.useState('');
            const [emailConfigStatus, setEmailConfigStatus] = React.useState(null); // {configured, from} | null
            const [logFilter, setLogFilter] = React.useState('');
            const [logStatus, setLogStatus] = React.useState('');
            const [page, setPage]           = React.useState(1);
            const [total, setTotal]         = React.useState(0);
            const [pageSize, setPageSize]   = React.useState(25);

            const bg   = dm ? '#0F172A' : '#F9FAFB';
            const card = dm ? '#1E293B' : '#FFFFFF';
            const bdr  = dm ? '#334155' : '#E2E8F0';
            const txt  = dm ? '#E2E8F0' : '#1E293B';
            const muted = dm ? '#94A3B8' : '#6B7280';

            const apiFetch = React.useCallback(async (path, opts = {}) => {
                const r = await fetch(BACKEND + path, { credentials: 'include', ...opts });
                if (!r.ok) {
                    const text = await r.text();
                    try { const j = JSON.parse(text); throw new Error(j.message || j.error || text); }
                    catch (parseErr) { if (parseErr instanceof SyntaxError) throw new Error(text); throw parseErr; }
                }
                return r.json();
            }, []);

            const showToast = (msg) => {
                setToastMsg(msg);
                setTimeout(() => setToastMsg(''), 3500);
            };

            const loadLogs = React.useCallback(async () => {
                setLoading(true);
                try {
                    const params = new URLSearchParams({ page, limit: pageSize });
                    if (logStatus) params.set('status', logStatus);
                    if (logFilter) params.set('search', logFilter);
                    const d = await apiFetch('/email/logs?' + params);
                    setLogs(d.logs || []);
                    setTotal(d.total || 0);
                } catch (e) { showToast('Failed to load logs: ' + e.message); }
                finally { setLoading(false); }
            }, [apiFetch, page, pageSize, logStatus, logFilter]);

            const loadQueue = React.useCallback(async () => {
                setLoading(true);
                try {
                    const d = await apiFetch('/email/queue');
                    setQueue(d.queue || []);
                } catch (e) { showToast('Failed to load queue: ' + e.message); }
                finally { setLoading(false); }
            }, [apiFetch]);

            const loadStats = React.useCallback(async () => {
                setLoading(true);
                try {
                    const d = await apiFetch('/email/stats');
                    setStats(d);
                } catch (e) { showToast('Failed to load stats: ' + e.message); }
                finally { setLoading(false); }
            }, [apiFetch]);

            // Load config status once on mount
            React.useEffect(() => {
                apiFetch('/email/config')
                    .then(d => setEmailConfigStatus(d))
                    .catch(() => {});
            }, []);

            React.useEffect(() => {
                if (tab === 'logs')  loadLogs();
                if (tab === 'queue') loadQueue();
                if (tab === 'stats') loadStats();
            }, [tab, page, pageSize, logStatus]);

            const handleTest = async () => {
                if (!testEmail.trim()) return showToast('Enter a recipient email first');
                try {
                    setLoading(true);
                    await apiFetch('/email/test', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ to: testEmail.trim() }) });
                    showToast('Test email sent to ' + testEmail.trim());
                } catch (e) { showToast('Test failed: ' + e.message); }
                finally { setLoading(false); }
            };

            const handleRetry = async (id) => {
                try {
                    await apiFetch('/email/retry/' + id, { method: 'POST' });
                    showToast('Retried — refreshing queue…');
                    loadQueue();
                } catch (e) { showToast('Retry failed: ' + e.message); }
            };

            const handleRetryAll = async () => {
                try {
                    setLoading(true);
                    const d = await apiFetch('/email/retry-all', { method: 'POST' });
                    showToast(`Queue flushed — ${d.processed || 0} processed`);
                    loadQueue();
                } catch (e) { showToast('Retry-all failed: ' + e.message); }
                finally { setLoading(false); }
            };

            const statusBadge = (s) => {
                const cfg = { sent: ['#10B981','#ECFDF5'], failed: ['#EF4444','#FEF2F2'], skipped: ['#6B7280','#F3F4F6'], pending: ['#F59E0B','#FFFBEB'], processing: ['#3B82F6','#EFF6FF'], permanently_failed: ['#991B1B','#FEF2F2'] };
                const [c, bg2] = cfg[s] || ['#6B7280','#F3F4F6'];
                return <span style={{padding:'2px 8px',borderRadius:12,background:bg2,color:c,fontSize:11,fontWeight:700}}>{s}</span>;
            };

            const tabStyle = (id) => ({
                padding:'8px 18px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight: tab === id ? 700 : 500,
                background: tab === id ? '#6D2773' : (dm ? '#1E293B' : '#F3F4F6'),
                color: tab === id ? '#fff' : muted,
            });

            return (
                <main style={{flex:1, overflowY:'auto', background:bg, padding:'24px'}}>
                    {toastMsg && (
                        <div style={{position:'fixed',top:20,right:20,background:'#1E293B',color:'#fff',padding:'10px 18px',borderRadius:10,zIndex:9999,fontSize:13,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
                            {toastMsg}
                        </div>
                    )}

                    <div style={{maxWidth:1100, margin:'0 auto'}}>
                        {/* Header */}
                        <div style={{marginBottom:24}}>
                            <h1 style={{fontSize:22,fontWeight:800,color:txt,margin:0,display:'flex',alignItems:'center',gap:'8px'}}><Icon name='mail-cog' size={22} color={txt} />Email Configuration</h1>
                            <p style={{fontSize:13,color:muted,margin:'4px 0 0'}}>Manage email delivery, view logs, and test configuration. Bootstrap Admin only.</p>
                        </div>

                        {/* Config status banner */}
                        {emailConfigStatus !== null && (
                            <div style={{
                                display:'flex',alignItems:'center',gap:10,padding:'10px 16px',
                                borderRadius:8,marginBottom:14,fontSize:13,fontWeight:500,
                                background: emailConfigStatus.configured
                                    ? (dm?'rgba(16,185,129,0.12)':'#ECFDF5')
                                    : (dm?'rgba(239,68,68,0.12)':'#FEF2F2'),
                                border: `1px solid ${emailConfigStatus.configured
                                    ? (dm?'rgba(16,185,129,0.3)':'#A7F3D0')
                                    : (dm?'rgba(239,68,68,0.3)':'#FECACA')}`,
                                color: emailConfigStatus.configured
                                    ? (dm?'#34d399':'#065F46')
                                    : (dm?'#f87171':'#991B1B'),
                            }}>
                                <Icon name={emailConfigStatus.configured?'check-circle':'alert-octagon'} size={15}
                                    color={emailConfigStatus.configured?(dm?'#34d399':'#10B981'):(dm?'#f87171':'#EF4444')} />
                                {emailConfigStatus.configured
                                    ? <span>Resend configured — sending from <strong>{emailConfigStatus.from}</strong></span>
                                    : <span><strong>RESEND_API_KEY not set.</strong> Add it to Vercel environment variables and redeploy.</span>
                                }
                            </div>
                        )}

                        {/* Test email card */}
                        <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:20,marginBottom:20,display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
                            <div style={{flex:1,minWidth:200}}>
                                <label style={{fontSize:12,fontWeight:600,color:muted,display:'block',marginBottom:6}}>Send Test Email</label>
                                <input value={testEmail} onChange={e=>setTestEmail(e.target.value)}
                                    onKeyDown={e=>e.key==='Enter'&&!loading&&handleTest()}
                                    placeholder="recipient@example.com"
                                    style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:13,boxSizing:'border-box'}}/>
                            </div>
                            <button onClick={handleTest} disabled={loading} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#6D2773',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:13}}>
                                Send Test
                            </button>
                            <button onClick={handleRetryAll} disabled={loading} style={{padding:'9px 20px',borderRadius:8,border:`1px solid ${bdr}`,background:'transparent',color:txt,fontWeight:600,cursor:'pointer',fontSize:13}}>
                                Flush Queue
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{display:'flex',gap:8,marginBottom:16}}>
                            {[['logs','Email Logs'],['queue','Queue'],['stats','Stats']].map(([id,label]) => (
                                <button key={id} style={tabStyle(id)} onClick={() => { setTab(id); setPage(1); }}>{label}</button>
                            ))}
                        </div>

                        {/* Email Logs tab */}
                        {tab === 'logs' && (
                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,overflow:'hidden'}}>
                                <div style={{padding:'14px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                                    <input value={logFilter} onChange={e=>{setLogFilter(e.target.value);setPage(1);}} placeholder="Search email / subject…"
                                        style={{padding:'7px 10px',borderRadius:6,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:12,width:220}}/>
                                    <select value={logStatus} onChange={e=>{setLogStatus(e.target.value);setPage(1);}}
                                        style={{padding:'7px 10px',borderRadius:6,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:12}}>
                                        <option value=''>All statuses</option>
                                        <option value='sent'>Sent</option>
                                        <option value='failed'>Failed</option>
                                        <option value='skipped'>Skipped</option>
                                    </select>
                                    <button onClick={()=>loadLogs()} style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>↻ Refresh</button>
                                    <span style={{marginLeft:'auto',fontSize:12,color:muted}}>{total} total</span>
                                </div>
                                <div style={{overflowX:'auto'}}>
                                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                                        <thead>
                                            <tr style={{background:dm?'#0F172A':'#F8FAFC'}}>
                                                {['To','Subject','Status','Ticket','Sent At'].map(h=>(
                                                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:muted,borderBottom:`1px solid ${bdr}`,whiteSpace:'nowrap'}}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading && <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:muted}}>Loading…</td></tr>}
                                            {!loading && !logs.length && <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:muted}}>No logs found</td></tr>}
                                            {logs.map(l => (
                                                <tr key={l.id} style={{borderBottom:`1px solid ${bdr}`}}>
                                                    <td style={{padding:'9px 14px',color:txt,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.recipient_email}</td>
                                                    <td style={{padding:'9px 14px',color:txt,maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={l.subject}>{l.subject}</td>
                                                    <td style={{padding:'9px 14px'}}>{statusBadge(l.status)}{l.error_message && <span title={l.error_message} style={{marginLeft:4,cursor:'help',color:'#EF4444',display:'inline-flex',alignItems:'center'}}><Icon name='alert-triangle' size={13} color='#EF4444' /></span>}</td>
                                                    <td style={{padding:'9px 14px',color:muted}}>{l.ticket_id ? `#${l.ticket_id}` : '—'}</td>
                                                    <td style={{padding:'9px 14px',color:muted,whiteSpace:'nowrap'}}>{l.sent_at ? new Date(l.sent_at).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <PageBar page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize}
                                    total={total} itemLabel='log' dm={dm} bg={bg} border={bdr} muted={muted} />
                            </div>
                        )}

                        {/* Queue tab */}
                        {tab === 'queue' && (
                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,overflow:'hidden'}}>
                                <div style={{padding:'14px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',gap:10,alignItems:'center'}}>
                                    <span style={{fontSize:13,fontWeight:600,color:txt}}>Notification Queue</span>
                                    <button onClick={loadQueue} style={{marginLeft:'auto',padding:'6px 12px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>↻ Refresh</button>
                                </div>
                                <div style={{overflowX:'auto'}}>
                                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                                        <thead>
                                            <tr style={{background:dm?'#0F172A':'#F8FAFC'}}>
                                                {['Event','Status','Retries','Next Retry','Created','Action'].map(h=>(
                                                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:muted,borderBottom:`1px solid ${bdr}`,whiteSpace:'nowrap'}}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading && <tr><td colSpan={6} style={{padding:24,textAlign:'center',color:muted}}>Loading…</td></tr>}
                                            {!loading && !queue.length && <tr><td colSpan={6} style={{padding:24,textAlign:'center',color:muted}}>Queue is empty</td></tr>}
                                            {queue.map(q => (
                                                <tr key={q.id} style={{borderBottom:`1px solid ${bdr}`}}>
                                                    <td style={{padding:'9px 14px',color:txt}}>{q.event_name}</td>
                                                    <td style={{padding:'9px 14px'}}>{statusBadge(q.status)}</td>
                                                    <td style={{padding:'9px 14px',color:muted,textAlign:'center'}}>{q.retry_count}</td>
                                                    <td style={{padding:'9px 14px',color:muted,whiteSpace:'nowrap'}}>{q.next_retry_at ? new Date(q.next_retry_at).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                                                    <td style={{padding:'9px 14px',color:muted,whiteSpace:'nowrap'}}>{new Date(q.created_at).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'})}</td>
                                                    <td style={{padding:'9px 14px'}}>
                                                        {['failed','permanently_failed','pending'].includes(q.status) && (
                                                            <button onClick={()=>handleRetry(q.id)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:'#6D2773',fontSize:11,cursor:'pointer',fontWeight:600}}>Retry</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Stats tab */}
                        {tab === 'stats' && stats && (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
                                {[
                                    ['Total Emails Logged', stats.logs?.total, '#6D2773'],
                                    ['Sent Successfully', stats.logs?.sent, '#10B981'],
                                    ['Failed', stats.logs?.failed, '#EF4444'],
                                    ['Skipped (no API key)', stats.logs?.skipped, '#6B7280'],
                                    ['Last 24h', stats.logs?.last_24h, '#F97316'],
                                    ['Queue: Pending', stats.queue?.pending, '#F59E0B'],
                                    ['Queue: Failed', stats.queue?.failed, '#EF4444'],
                                    ['Queue: Perm. Failed', stats.queue?.permanently_failed, '#991B1B'],
                                ].map(([label, val, color]) => (
                                    <div key={label} style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:20}}>
                                        <div style={{fontSize:24,fontWeight:800,color}}>{val ?? 0}</div>
                                        <div style={{fontSize:12,color:muted,marginTop:4}}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {tab === 'stats' && !stats && !loading && (
                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:32,textAlign:'center',color:muted}}>
                                <button onClick={loadStats} style={{padding:'9px 20px',borderRadius:8,border:`1px solid ${bdr}`,background:'transparent',color:txt,cursor:'pointer',fontSize:13}}>Load Stats</button>
                            </div>
                        )}
                    </div>
                </main>
            );
        });

        // ============================================================
        // VEHICLE MANAGEMENT PAGE
        // ============================================================
        const VEHICLE_BRAND_DOMAINS = {
            'Toyota':       'toyota.com',
            'Ford':         'ford.com',
            'Tesla':        'tesla.com',
            'LDV':          'ldvmotors.com',
            'Honda':        'honda.com',
            'Hyundai':      'hyundai.com',
            'Kia':          'kia.com',
            'Nissan':       'nissan.com',
            'Mazda':        'mazda.com',
            'Mitsubishi':   'mitsubishi-motors.com',
            'Subaru':       'subaru.com',
            'Volkswagen':   'vw.com',
            'BMW':          'bmw.com',
            'Mercedes':     'mercedes-benz.com',
            'Mercedes-Benz':'mercedes-benz.com',
            'Audi':         'audi.com',
            'Isuzu':        'isuzu.com',
            'Holden':       'holden.com.au',
            'Jeep':         'jeep.com',
            'Land Rover':   'landrover.com',
            'Volvo':        'volvocars.com',
            'Dodge':        'dodge.com',
            'Chevrolet':    'chevrolet.com',
            'Ram':          'ramtrucks.com',
            'Renault':      'renault.com',
            'Peugeot':      'peugeot.com',
            'Fiat':         'fiat.com',
            'Alfa Romeo':   'alfaromeo.com',
            'Porsche':      'porsche.com',
            'Lexus':        'lexus.com',
            'Infiniti':     'infiniti.com',
            'Acura':        'acura.com',
            'Cadillac':     'cadillac.com',
            'Lincoln':      'lincoln.com',
            'Mini':         'mini.com',
            'BYD':          'byd.com',
            'MG':           'mgmotor.com.au',
            'GWM':          'gwm.com.au',
            'Haval':        'haval.com.au',
            'Chery':        'cheryinternational.com',
            'Geely':        'geely.com',
            'Great Wall':   'gwm.com.au',
            'Suzuki':       'suzuki.com',
            'Daihatsu':     'daihatsu.com',
            'Skoda':        'skoda-auto.com',
            'Seat':         'seat.com',
            'Jaguar':       'jaguar.com',
            'Bentley':      'bentleymotors.com',
            'Rolls-Royce':  'rolls-roycemotorcars.com',
            'Ferrari':      'ferrari.com',
            'Lamborghini':  'lamborghini.com',
            'Maserati':     'maserati.com',
            'McLaren':      'mclaren.com',
            'Bugatti':      'bugatti.com',
            'Rivian':       'rivian.com',
            'Lucid':        'lucidmotors.com',
            'Polestar':     'polestar.com',
        };

        // Defined OUTSIDE VehicleManagementPage so it's a stable reference (avoids remount on re-render)
        // Uses Google S2 favicon service — reliable, free, no API key, works for any domain.
        // Falls back to truck icon if the logo cannot be resolved.
        function VehicleBrandIcon({ make, size = 22, iconColor }) {
            const [failed, setFailed] = React.useState(false);
            const fallbackColor = iconColor || '#1B75BB';

            const domain = React.useMemo(() => {
                if (!make) return null;
                const m = make.trim();
                // Curated map for accuracy; unknown/future brands auto-try {slug}.com
                return VEHICLE_BRAND_DOMAINS[m] || `${m.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
            }, [make]);

            if (failed || !domain) {
                return <Icon name='truck' size={size - 4} color={fallbackColor} />;
            }

            // Google S2 favicon service — sz=64 gives sharp 48×48 px image, no CORS issues
            return (
                <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                    alt={make || 'Vehicle'}
                    width={size}
                    height={size}
                    style={{ objectFit: 'contain', display: 'block', borderRadius: '2px' }}
                    onError={() => setFailed(true)}
                />
            );
        }

        const VehicleManagementPage = React.memo(function VehicleManagementPage() {
            const STATUS_LABELS = { active: 'Active', in_service: 'In Service', retired: 'Retired' };
            const STATUS_COLORS = { active: '#5F8F6E', in_service: '#B08D3F', retired: '#8B93A1' };
            const COMPANY_LABELS = { YC: 'Yahweh Care (YC)', YPC: 'Yahweh Property Care (YPC)' };
            const ALERT_GROUPS = [
                { type: 'rego_expiry',    label: 'Registration Expiry',        color: '#3B82F6', icon: 'calendar',      desc: 'Remind staff when vehicle registrations are approaching expiry' },
                { type: 'comp_insurance', label: 'Comprehensive Insurance',    color: '#8B5CF6', icon: 'shield',        desc: 'Remind staff when comprehensive insurance policies are due to expire' },
                { type: 'ctp_expiry',     label: 'CTP / Green Slip',           color: '#10B981', icon: 'check-circle',  desc: 'Remind staff when CTP/Green Slip policies are due to expire' },
                { type: 'service_due',    label: 'Service Reminders',          color: '#F59E0B', icon: 'wrench',        desc: 'Remind staff when vehicle services are coming due' },
                { type: 'event',          label: 'Event Notifications',        color: '#EF4444', icon: 'bell',          desc: 'Instant alerts when vehicle status or assignments change' },
            ];
            const EMPTY_FORM = {
                registration_number: '', make: '', model: '', year: '', color: '', company: '', assigned_to: '',
                assigned_to_external: '', assignee_type: 'staff',
                status: 'active', registration_expiry: '',
                comprehensive_insurer: '', insurance_expiry: '',
                ctp_insurer: '', ctp_expiry: '',
                next_service_due: '', notes: '',
            };

            const dm = useDark();
            const pageBg  = dm ? '#0F172A' : '#F9FAFB';
            const cardBg  = dm ? '#1E293B' : '#FFFFFF';
            const borderC = dm ? '#334155' : '#E2E8F0';
            const textP   = dm ? '#E2E8F0' : '#1E293B';
            const textM   = dm ? '#94A3B8' : '#6B7280';
            const BRAND   = '#6D2773';

            const [activeTab,    setActiveTab]    = React.useState('fleet');
            const [vehicles,     setVehicles]     = React.useState([]);
            const [staffList,    setStaffList]    = React.useState([]);
            const [loading,      setLoading]      = React.useState(true);
            const [search,       setSearch]       = React.useState('');
            const debouncedSearch = useDebounce(search, 150);
            const [statusFilter, setStatusFilter] = React.useState('all');
            const [companyFilter, setCompanyFilter] = React.useState('all');
            const [fleetPage,    setFleetPage]    = React.useState(1);
            const [fleetPageSize, setFleetPageSize] = React.useState(10);
            const [showModal,    setShowModal]    = React.useState(false);
            const [modalMode,    setModalMode]    = React.useState('add');
            const [selVehicle,   setSelVehicle]   = React.useState(null);
            const [delConfirm,   setDelConfirm]   = React.useState(null);
            const [saving,       setSaving]       = React.useState(false);
            const [error,        setError]        = React.useState('');
            const [toast,        setToast]        = React.useState(null);
            const [form,         setForm]         = React.useState(EMPTY_FORM);
            // Alerts tab state
            const [alertConfigs,  setAlertConfigs]  = React.useState([]);
            const [alertSaving,   setAlertSaving]   = React.useState({});
            const [alertTesting,  setAlertTesting]  = React.useState({});
            const [expandedAlert, setExpandedAlert] = React.useState(null);
            // Analytics tab refs
            const makeChartRef    = React.useRef(null);
            const ageChartRef     = React.useRef(null);
            const statusChartRef  = React.useRef(null);
            const makeChartInst   = React.useRef(null);
            const ageChartInst    = React.useRef(null);
            const statusChartInst = React.useRef(null);

            const showToast = (message, tone='success') => { setToast({message, tone}); setTimeout(()=>setToast(null),3000); };

            const fetchAll = React.useCallback(async () => {
                setLoading(true);
                try {
                    const [vR, sR] = await Promise.all([
                        fetch(`${HRMS_API}/vehicles`, { credentials:'include', headers: authHeaders() }),
                        fetch(`${HRMS_API}/users?limit=200&status=active`, { credentials:'include', headers: authHeaders() }),
                    ]);
                    const [vd, sd] = await Promise.all([vR.json(), sR.json()]);
                    if (!vR.ok) throw new Error(vd.message || vd.error || 'Failed to load vehicles');
                    setVehicles(vd.vehicles || []);
                    setStaffList(sd.users || sd.staff || []);
                } catch(e) { setError('Failed to load fleet data: ' + e.message); }
                finally { setLoading(false); }
            }, []);

            const fetchAlertConfigs = React.useCallback(async () => {
                try {
                    const res = await authFetch(`${HRMS_API}/vehicles/alert-settings`);
                    if (res.ok) { const d = await res.json(); setAlertConfigs(d.configs || []); }
                } catch(e) {}
            }, []);

            React.useEffect(() => { fetchAll(); fetchAlertConfigs(); }, [fetchAll, fetchAlertConfigs]);

            const filtered = React.useMemo(() => {
                const q = debouncedSearch.toLowerCase();
                return vehicles.filter(v =>
                    (!q || v.registration_number?.toLowerCase().includes(q) || v.make?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q) || v.color?.toLowerCase().includes(q) || v.assigned_to_name?.toLowerCase().includes(q)) &&
                    (statusFilter==='all' || v.status===statusFilter) &&
                    (companyFilter==='all' || v.company===companyFilter)
                );
            }, [vehicles, debouncedSearch, statusFilter, companyFilter]);

            // Reset to page 1 when filters/search change
            React.useEffect(() => { setFleetPage(1); }, [debouncedSearch, statusFilter, companyFilter]);

            const fleetTotalPages = Math.max(1, Math.ceil(filtered.length / fleetPageSize));
            const fleetSafePage   = Math.min(fleetPage, fleetTotalPages);
            const pagedVehicles   = filtered.slice((fleetSafePage - 1) * fleetPageSize, fleetSafePage * fleetPageSize);

            const openAdd = () => { setForm(EMPTY_FORM); setModalMode('add'); setSelVehicle(null); setError(''); setShowModal(true); };
            const openEdit = (v) => {
                setForm({
                    registration_number: v.registration_number || '', make: v.make || '', model: v.model || '',
                    year: v.year || '', color: v.color || '', company: v.company || '',
                    assigned_to: v.assigned_to || '',
                    assigned_to_external: v.assigned_to_external || '',
                    assignee_type: v.assigned_to_external ? 'external' : 'staff',
                    status: v.status || 'active',
                    registration_expiry: v.registration_expiry ? v.registration_expiry.slice(0,10) : '',
                    comprehensive_insurer: v.comprehensive_insurer || '',
                    insurance_expiry: v.insurance_expiry ? v.insurance_expiry.slice(0,10) : '',
                    ctp_insurer: v.ctp_insurer || '',
                    ctp_expiry: v.ctp_expiry ? v.ctp_expiry.slice(0,10) : '',
                    next_service_due: v.next_service_due ? v.next_service_due.slice(0,10) : '',
                    notes: v.notes || '',
                });
                setSelVehicle(v); setModalMode('edit'); setError(''); setShowModal(true);
            };

            const handleSave = async () => {
                if (!form.registration_number.trim()) return setError('Registration number is required');
                if (!form.make.trim())  return setError('Make is required');
                if (!form.model.trim()) return setError('Model is required');
                setSaving(true); setError('');
                try {
                    const payload = {
                        registration_number: form.registration_number.trim(),
                        make: form.make.trim(),
                        model: form.model.trim(),
                        year: form.year || null,
                        color: form.color || null,
                        company: form.company || null,
                        assigned_to: form.assignee_type === 'staff' ? (form.assigned_to || null) : null,
                        assigned_to_external: form.assignee_type === 'external' ? (form.assigned_to_external.trim() || null) : null,
                        status: form.status || 'active',
                        registration_expiry: form.registration_expiry || null,
                        comprehensive_insurer: form.comprehensive_insurer || null,
                        insurance_expiry: form.insurance_expiry || null,
                        ctp_insurer: form.ctp_insurer || null,
                        ctp_expiry: form.ctp_expiry || null,
                        next_service_due: form.next_service_due || null,
                        notes: form.notes || null,
                    };
                    const url    = modalMode==='add' ? `${HRMS_API}/vehicles` : `${HRMS_API}/vehicles/${selVehicle.id}`;
                    const method = modalMode==='add' ? 'POST' : 'PATCH';
                    const res = await authFetch(url, { method, body:JSON.stringify(payload) });
                    if (!res.ok) {
                        const e = await res.json().catch(()=>({}));
                        if (res.status === 401) throw new Error('Session expired — please sign out and sign back in.');
                        throw new Error(e.message || e.error || 'Save failed');
                    }
                    setShowModal(false);
                    showToast(modalMode==='add' ? 'Vehicle added to fleet' : 'Vehicle updated');
                    fetchAll();
                } catch(e) { setError(e.message); }
                finally { setSaving(false); }
            };

            const handleDelete = async () => {
                if (!delConfirm) return;
                try {
                    const res  = await authFetch(`${HRMS_API}/vehicles/${delConfirm.id}`, { method:'DELETE' });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || data.error || 'Delete failed');
                    setDelConfirm(null);
                    showToast(data.message || 'Vehicle removed from fleet');
                    fetchAll();
                } catch(e) { setError(e.message); }
            };

            // ── Alert helpers ─────────────────────────────────────────────────────────
            const updateAlertConfig = async (key, patch) => {
                setAlertSaving(s => ({...s, [key]: true}));
                try {
                    const res = await authFetch(`${HRMS_API}/vehicles/alert-settings/${key}`, {
                        method: 'PUT', body: JSON.stringify(patch),
                    });
                    if (res.ok) {
                        const d = await res.json();
                        setAlertConfigs(cs => cs.map(c => c.alert_key === key ? {...c, ...d.config} : c));
                        showToast('Alert settings saved');
                    } else { showToast('Failed to save alert', 'error'); }
                } catch(e) { showToast('Failed to save alert', 'error'); }
                finally { setAlertSaving(s => ({...s, [key]: false})); }
            };

            const testAlert = async (key) => {
                setAlertTesting(s => ({...s, [key]: true}));
                try {
                    const res = await authFetch(`${HRMS_API}/vehicles/alert-settings/${key}/test`, { method: 'POST' });
                    const d = await res.json();
                    showToast(res.ok ? (d.message || 'Test sent') : 'Test failed', res.ok ? 'success' : 'error');
                } catch(e) { showToast('Test failed', 'error'); }
                finally { setAlertTesting(s => ({...s, [key]: false})); }
            };

            const toggleAlertRecipient = (key, userId, checked) => {
                const cfg = alertConfigs.find(c => c.alert_key === key);
                if (!cfg) return;
                const current = Array.isArray(cfg.recipient_user_ids) ? cfg.recipient_user_ids : [];
                const next = checked ? [...new Set([...current, userId])] : current.filter(id => id !== userId);
                updateAlertConfig(key, { recipient_user_ids: next });
            };

            // ── Analytics: Chart.js charts ────────────────────────────────────────────
            React.useEffect(() => {
                if (activeTab !== 'analytics' || vehicles.length === 0) return;
                loadChartJs().then(() => {
                    const gridC = dm ? 'rgba(27,117,187,0.08)' : '#F3F4F6';
                    const tickC = dm ? '#4a607f' : '#94A3B8';

                    // Make distribution chart
                    if (makeChartRef.current) {
                        if (makeChartInst.current) makeChartInst.current.destroy();
                        const makeCounts = {};
                        vehicles.forEach(v => { if (v.make) makeCounts[v.make] = (makeCounts[v.make]||0)+1; });
                        const sorted = Object.entries(makeCounts).sort((a,b)=>b[1]-a[1]);
                        const PALETTE = ['#1B75BB','#5F8F6E','#B08D3F','#8B5CF6','#EF4444','#10B981','#F59E0B','#3B82F6'];
                        makeChartInst.current = new Chart(makeChartRef.current, {
                            type: 'bar',
                            data: {
                                labels: sorted.map(([k])=>k),
                                datasets: [{ label: 'Vehicles', data: sorted.map(([,v])=>v), backgroundColor: sorted.map((_,i)=>PALETTE[i%PALETTE.length]), borderRadius: 6, borderSkipped: false }],
                            },
                            options: { indexAxis:'y', responsive:true, plugins:{legend:{display:false}}, scales:{ x:{beginAtZero:true,grid:{color:gridC},ticks:{stepSize:1,color:tickC}}, y:{grid:{display:false},ticks:{color:dm?'#8fa4cc':'#334155'}} } },
                        });
                    }

                    // Status doughnut
                    if (statusChartRef.current) {
                        if (statusChartInst.current) statusChartInst.current.destroy();
                        const active = vehicles.filter(v=>v.status==='active').length;
                        const inSvc  = vehicles.filter(v=>v.status==='in_service').length;
                        const retired= vehicles.filter(v=>v.status==='retired').length;
                        statusChartInst.current = new Chart(statusChartRef.current, {
                            type: 'doughnut',
                            data: { labels:['Active','In Service','Retired'], datasets:[{ data:[active,inSvc,retired], backgroundColor:['#5F8F6E','#B08D3F','#8B93A1'], borderWidth:2, borderColor: dm?'#1E293B':'#fff', hoverOffset:6 }] },
                            options: { responsive:true, cutout:'68%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, padding:12, font:{size:11}, color: dm?'#8fa4cc':'#334155' } } } },
                        });
                    }

                    // Fleet age bar chart
                    if (ageChartRef.current) {
                        if (ageChartInst.current) ageChartInst.current.destroy();
                        const yr = new Date().getFullYear();
                        const ageBuckets = {'0–2 yrs':0,'3–5 yrs':0,'6–9 yrs':0,'10+ yrs':0};
                        vehicles.forEach(v => {
                            if (!v.year) return;
                            const age = yr - v.year;
                            if (age <= 2) ageBuckets['0–2 yrs']++;
                            else if (age <= 5) ageBuckets['3–5 yrs']++;
                            else if (age <= 9) ageBuckets['6–9 yrs']++;
                            else ageBuckets['10+ yrs']++;
                        });
                        ageChartInst.current = new Chart(ageChartRef.current, {
                            type: 'bar',
                            data: { labels: Object.keys(ageBuckets), datasets:[{ label:'Vehicles', data:Object.values(ageBuckets), backgroundColor:['#1B75BB','#5F8F6E','#B08D3F','#EF4444'], borderRadius:8, borderSkipped:false }] },
                            options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,grid:{color:gridC},ticks:{stepSize:1,color:tickC}}, x:{grid:{display:false},ticks:{color:dm?'#8fa4cc':'#334155'}} } },
                        });
                    }
                });
                return () => {
                    if (makeChartInst.current)   { makeChartInst.current.destroy();   makeChartInst.current   = null; }
                    if (statusChartInst.current) { statusChartInst.current.destroy(); statusChartInst.current = null; }
                    if (ageChartInst.current)    { ageChartInst.current.destroy();    ageChartInst.current    = null; }
                };
            }, [activeTab, vehicles, dm]);

            // Returns { label, color } if a date is within `withinDays` or already past, else null
            const expiryFlag = (dateStr, withinDays=30) => {
                if (!dateStr) return null;
                const d = new Date(dateStr);
                const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
                if (diffDays < 0) return { label: 'Overdue', color: '#DC2626' };
                if (diffDays <= withinDays) return { label: `${diffDays}d left`, color: '#B45309' };
                return null;
            };

            const expiringSoonCount = React.useMemo(() => vehicles.filter(v =>
                expiryFlag(v.registration_expiry) || expiryFlag(v.insurance_expiry) || expiryFlag(v.ctp_expiry) || expiryFlag(v.next_service_due)
            ).length, [vehicles]);

            const inputStyle = { width:'100%', padding:'8px 10px', border:`1px solid ${borderC}`, borderRadius:'6px', fontSize:'13px', boxSizing:'border-box', background:cardBg, color:textP };
            const labelStyle = { fontSize:'12px', fontWeight:'600', color:dm?'#c0cfec':'#334155', marginBottom:'4px', display:'block' };

            const DateCell = ({ value, insurer }) => {
                const flag = expiryFlag(value);
                if (!value) return <span style={{fontSize:'12px',color:dm?'#4a607f':'#94A3B8'}}>—</span>;
                return (
                    <div>
                        <div style={{fontSize:'12px',color:dm?'#c0cfec':'#334155'}}>{new Date(value).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'})}</div>
                        {insurer && <div style={{fontSize:'10px',color:textM}}>{insurer}</div>}
                        {flag && <div style={{fontSize:'10px',fontWeight:'700',color:flag.color}}>{flag.label}</div>}
                    </div>
                );
            };

            return (
                <main className="flex-1 overflow-auto" style={{background:pageBg}}>
                    {/* Toast */}
                    {toast && (
                        <div style={{position:'fixed',top:20,right:20,zIndex:9999,background:dm?'#1E293B':'#0F172A',color:'#fff',padding:'10px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:'600',boxShadow:'0 4px 16px rgba(0,0,0,0.25)',display:'flex',alignItems:'center',gap:'8px'}}>
                            <Icon name={toast.tone==='error'?'alert-triangle':'check-circle'} size={15} color={toast.tone==='error'?'#F87171':'#34D399'} />
                            {toast.message}
                        </div>
                    )}

                    <div style={{padding:'24px 28px'}}>
                        {/* Header */}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:BRAND,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 3px 10px ${BRAND}55`}}>
                                    <Icon name='truck' size={19} color='#fff' />
                                </div>
                                <div>
                                    <h1 style={{fontSize:'22px',fontWeight:'700',color:textP,margin:0}}>Vehicle Management</h1>
                                    <p style={{fontSize:'12px',color:textM,margin:'2px 0 0'}}>Track the Yahwehcare fleet — registration, assignment, and upcoming renewals</p>
                                </div>
                            </div>
                            {activeTab === 'fleet' && (
                                <button onClick={openAdd}
                                    style={{padding:'9px 18px',background:BRAND,color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px'}}>
                                    <Icon name='plus-circle' size={14} color='#fff' />Add Vehicle
                                </button>
                            )}
                        </div>

                        {/* ── Tab Bar ─────────────────────────────────────────────── */}
                        <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:dm?'#0F172A':'#F1F5F9',borderRadius:'10px',padding:'4px',border:`1px solid ${borderC}`,width:'fit-content'}}>
                            {[
                                {id:'fleet',     label:'Fleet',     icon:'truck'},
                                {id:'alerts',    label:'Alerts',    icon:'bell'},
                                {id:'analytics', label:'Analytics', icon:'bar-chart-2'},
                            ].map(tab => (
                                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                                    style={{padding:'7px 18px',border:'none',borderRadius:'7px',cursor:'pointer',fontSize:'13px',fontWeight:'600',
                                        background: activeTab===tab.id ? (dm?'#1E293B':'#FFFFFF') : 'transparent',
                                        color: activeTab===tab.id ? textP : textM,
                                        boxShadow: activeTab===tab.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                        display:'flex',alignItems:'center',gap:'6px',transition:'all 0.15s'}}>
                                    <Icon name={tab.icon} size={13} color={activeTab===tab.id ? BRAND : textM} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ══════════════════════ FLEET TAB ══════════════════════ */}
                        {activeTab === 'fleet' && (<>
                        {/* Filters */}
                        <div style={{display:'flex',gap:'10px',marginBottom:'16px',flexWrap:'wrap'}}>
                            <input type="text" placeholder="Search plate, make, model or assigned staff…" value={search} onChange={e=>setSearch(e.target.value)}
                                style={{flex:1,minWidth:'200px',padding:'8px 12px',border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',background:cardBg,color:textP}} />
                            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                                style={{padding:'8px 12px',border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',background:cardBg,color:textP}}>
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="in_service">In Service</option>
                                <option value="retired">Retired</option>
                            </select>
                            <select value={companyFilter} onChange={e=>setCompanyFilter(e.target.value)}
                                style={{padding:'8px 12px',border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',background:cardBg,color:textP}}>
                                <option value="all">All Companies</option>
                                <option value="YC">Yahweh Care (YC)</option>
                                <option value="YPC">Yahweh Property Care (YPC)</option>
                            </select>
                            <div style={{padding:'8px 14px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',color:textP,fontWeight:'600'}}>
                                {filtered.length} vehicle{filtered.length!==1?'s':''}
                            </div>
                        </div>

                        {/* Error */}
                        {error && !showModal && (
                            <div style={{background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',border:`1px solid ${dm?'rgba(239,68,68,0.3)':'#FECACA'}`,borderRadius:'8px',padding:'10px 14px',marginBottom:'12px',fontSize:'13px',color:'#DC2626',display:'flex',alignItems:'center',gap:'6px'}}>
                                <Icon name='alert-triangle' size={13} color='#DC2626' /> {error}
                            </div>
                        )}

                        {/* Vehicles Table */}
                        <div style={{background:cardBg,borderRadius:'12px',border:`1px solid ${borderC}`,overflow:'hidden'}}>
                            {loading ? (
                                <div style={{padding:'40px',textAlign:'center',color:textM,fontSize:'14px'}}>Loading fleet…</div>
                            ) : filtered.length === 0 ? (
                                <div style={{padding:'40px',textAlign:'center',color:textM,fontSize:'14px'}}>No vehicles found</div>
                            ) : (
                                <div style={{overflowX:'auto'}}>
                                <table style={{width:'100%',borderCollapse:'collapse',minWidth:'1100px'}}>
                                    <thead>
                                        <tr style={{background:dm?'#0F172A':'#F8FAFC',borderBottom:`1px solid ${borderC}`}}>
                                            {['Vehicle','Assigned To','Status','Rego Expiry','Comprehensive Insurance','CTP / Green Slip','Next Service','Actions'].map(h=>(
                                                <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:'11px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedVehicles.map(v=>(
                                            <tr key={v.id} style={{borderBottom:`1px solid ${borderC}`}} className="table-row">
                                                <td style={{padding:'12px 14px'}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                        <div style={{width:36,height:36,borderRadius:'9px',background:dm?'#1E293B':'#F1F5F9',border:`1px solid ${borderC}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,padding:'6px',boxSizing:'border-box',overflow:'hidden'}}>
                                                            <VehicleBrandIcon make={v.make} size={24} iconColor={BRAND} />
                                                        </div>
                                                        <div>
                                                            <div style={{fontSize:'13px',fontWeight:'700',color:textP,display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                                {v.registration_number}
                                                                {v.company && (
                                                                    <span style={{fontSize:'9px',fontWeight:'700',padding:'1px 6px',borderRadius:'8px',background:v.company==='YC'?'#EAF4EC':'#EFF6FF',color:v.company==='YC'?'#2F5E3F':'#1D4ED8'}}>{v.company}</span>
                                                                )}
                                                            </div>
                                                            <div style={{fontSize:'11px',color:textM}}>{v.make} {v.model}{v.year ? ` · ${v.year}` : ''}{v.color ? ` · ${v.color}` : ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{padding:'12px 14px',fontSize:'12px',color:dm?'#c0cfec':'#334155'}}>
                                                    {v.assigned_to_name || <span style={{fontStyle:'italic',color:dm?'#4a607f':'#94A3B8'}}>Unassigned</span>}
                                                </td>
                                                <td style={{padding:'12px 14px'}}>
                                                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'6px',background:`${STATUS_COLORS[v.status]||'#7EB842'}18`,color:STATUS_COLORS[v.status]||'#7EB842',border:`1px solid ${STATUS_COLORS[v.status]||'#7EB842'}30`}}>
                                                        {STATUS_LABELS[v.status]||v.status}
                                                    </span>
                                                </td>
                                                <td style={{padding:'12px 14px'}}><DateCell value={v.registration_expiry} /></td>
                                                <td style={{padding:'12px 14px'}}><DateCell value={v.insurance_expiry} insurer={v.comprehensive_insurer} /></td>
                                                <td style={{padding:'12px 14px'}}><DateCell value={v.ctp_expiry} insurer={v.ctp_insurer} /></td>
                                                <td style={{padding:'12px 14px'}}><DateCell value={v.next_service_due} /></td>
                                                <td style={{padding:'12px 14px'}}>
                                                    <div style={{display:'flex',gap:'6px'}}>
                                                        <button onClick={()=>openEdit(v)} title="Edit"
                                                            style={{background:'none',border:`1px solid ${borderC}`,borderRadius:'6px',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                            <Icon name='pencil' size={13} color={textM} />
                                                        </button>
                                                        <button onClick={()=>setDelConfirm(v)} title="Remove"
                                                            style={{background:'none',border:`1px solid ${borderC}`,borderRadius:'6px',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                            <Icon name='trash-2' size={13} color='#DC2626' />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            )}
                            {!loading && filtered.length > 0 && (
                                <PageBar
                                    page={fleetSafePage} setPage={setFleetPage}
                                    pageSize={fleetPageSize} setPageSize={setFleetPageSize}
                                    total={filtered.length}
                                    itemLabel="vehicle"
                                    dm={dm} bg={cardBg} border={borderC} muted={textM}
                                />
                            )}
                        </div>

                        {/* Stats row */}
                        {!loading && (
                            <div style={{display:'flex',gap:'12px',marginTop:'14px',flexWrap:'wrap'}}>
                                {[
                                    {label:'Total Vehicles', val:vehicles.length,                                     color:'#5B7C99', icon:'truck'},
                                    {label:'Active',         val:vehicles.filter(v=>v.status==='active').length,      color:'#5F8F6E', icon:'check-circle'},
                                    {label:'In Service',     val:vehicles.filter(v=>v.status==='in_service').length,  color:'#B08D3F', icon:'wrench'},
                                    {label:'Retired',        val:vehicles.filter(v=>v.status==='retired').length,     color:'#8B93A1', icon:'x-circle'},
                                    {label:'Expiring Soon',  val:expiringSoonCount,                                   color:'#B0655B', icon:'alert-triangle'},
                                ].map(s=>(
                                    <div key={s.label} className="stat-card" style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'10px',padding:'10px 16px',display:'flex',gap:'10px',alignItems:'center',cursor:'default'}}>
                                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:s.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                            <Icon name={s.icon} size={13} color='#fff' />
                                        </div>
                                        <div>
                                            <div style={{fontSize:'18px',fontWeight:'700',color:textP,lineHeight:1.1}}>{s.val}</div>
                                            <div style={{fontSize:'11px',color:textM,fontWeight:'600'}}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        </>)}

                        {/* ══════════════════════ ALERTS TAB ══════════════════════ */}
                        {activeTab === 'alerts' && (() => {
                            const ToggleSwitch = ({checked, onChange, disabled}) => (
                                <div onClick={()=>!disabled&&onChange(!checked)}
                                    style={{width:'36px',height:'20px',borderRadius:'10px',background:checked?BRAND:dm?'#334155':'#CBD5E1',cursor:disabled?'default':'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
                                    <div style={{position:'absolute',top:'2px',left:checked?'18px':'2px',width:'16px',height:'16px',borderRadius:'50%',background:'white',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.25)'}} />
                                </div>
                            );
                            const ChannelBadge = ({label, checked, color, onChange}) => (
                                <button onClick={onChange}
                                    style={{padding:'4px 10px',border:`1px solid ${checked?color:borderC}`,borderRadius:'6px',background:checked?`${color}18`:'transparent',color:checked?color:textM,fontSize:'11px',fontWeight:'600',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px',transition:'all 0.15s'}}>
                                    <Icon name={label==='Email'?'mail':'bell'} size={11} color={checked?color:textM} />
                                    {label}
                                </button>
                            );
                            return (
                                <div>
                                    {/* Info banner */}
                                    <div style={{background:dm?'rgba(27,117,187,0.10)':'#EFF6FF',border:`1px solid ${dm?'rgba(27,117,187,0.25)':'#BFDBFE'}`,borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
                                        <Icon name='bell' size={16} color={BRAND} style={{flexShrink:0,marginTop:1}} />
                                        <div>
                                            <div style={{fontSize:'13px',fontWeight:'600',color:textP}}>Vehicle Alert System</div>
                                            <div style={{fontSize:'12px',color:textM,marginTop:'2px'}}>Configure which events trigger notifications, choose delivery channels (email / push), and select which team members receive each alert. Toggle the master switch to enable or disable any rule.</div>
                                        </div>
                                    </div>

                                    {alertConfigs.length === 0 && (
                                        <div style={{textAlign:'center',padding:'40px',color:textM,fontSize:'14px'}}>Loading alert configurations…</div>
                                    )}

                                    {ALERT_GROUPS.map(group => {
                                        const configs = alertConfigs.filter(c => c.alert_type === group.type);
                                        if (configs.length === 0) return null;
                                        return (
                                            <div key={group.type} style={{marginBottom:'24px'}}>
                                                {/* Group header */}
                                                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                                                    <div style={{width:'28px',height:'28px',borderRadius:'7px',background:`${group.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                                        <Icon name={group.icon} size={13} color={group.color} />
                                                    </div>
                                                    <div>
                                                        <div style={{fontSize:'13px',fontWeight:'700',color:textP}}>{group.label}</div>
                                                        <div style={{fontSize:'11px',color:textM}}>{group.desc}</div>
                                                    </div>
                                                </div>

                                                {/* Alert config cards */}
                                                <div style={{display:'flex',flexDirection:'column',gap:'8px',paddingLeft:'4px'}}>
                                                    {configs.map(cfg => {
                                                        const isSaving = alertSaving[cfg.alert_key];
                                                        const isTesting = alertTesting[cfg.alert_key];
                                                        const isExpanded = expandedAlert === cfg.alert_key;
                                                        const recipients = Array.isArray(cfg.recipient_user_ids) ? cfg.recipient_user_ids : [];
                                                        return (
                                                            <div key={cfg.alert_key}
                                                                style={{background:cardBg,border:`1px solid ${cfg.is_active?group.color+'30':borderC}`,borderRadius:'10px',overflow:'hidden',transition:'border-color 0.2s'}}>
                                                                {/* Card header row */}
                                                                <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
                                                                    <ToggleSwitch
                                                                        checked={cfg.is_active}
                                                                        disabled={isSaving}
                                                                        onChange={v => updateAlertConfig(cfg.alert_key, {is_active: v})}
                                                                    />
                                                                    <div style={{flex:1}}>
                                                                        <div style={{fontSize:'13px',fontWeight:'600',color:cfg.is_active?textP:textM}}>{cfg.label}</div>
                                                                        <div style={{fontSize:'11px',color:textM,marginTop:'2px'}}>{cfg.description}</div>
                                                                    </div>
                                                                    {/* Channel toggles (only shown when active) */}
                                                                    {cfg.is_active && (
                                                                        <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                                                                            <ChannelBadge label="Email" checked={cfg.email_enabled} color={BRAND} onChange={()=>updateAlertConfig(cfg.alert_key,{email_enabled:!cfg.email_enabled})} />
                                                                            <ChannelBadge label="Push" checked={cfg.push_enabled} color='#8B5CF6' onChange={()=>updateAlertConfig(cfg.alert_key,{push_enabled:!cfg.push_enabled})} />
                                                                        </div>
                                                                    )}
                                                                    {/* Expand/collapse + test */}
                                                                    <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                                                                        {cfg.is_active && (cfg.email_enabled || cfg.push_enabled) && (
                                                                            <button onClick={()=>testAlert(cfg.alert_key)} disabled={isTesting}
                                                                                title="Send test notification"
                                                                                style={{padding:'4px 10px',border:`1px solid ${borderC}`,borderRadius:'6px',background:'transparent',color:textM,fontSize:'11px',fontWeight:'600',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px',opacity:isTesting?0.6:1}}>
                                                                                <Icon name='send' size={11} color={textM} />
                                                                                {isTesting ? 'Sending…' : 'Test'}
                                                                            </button>
                                                                        )}
                                                                        <button onClick={()=>setExpandedAlert(isExpanded?null:cfg.alert_key)}
                                                                            style={{background:'none',border:`1px solid ${borderC}`,borderRadius:'6px',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                                                                            title={isExpanded?'Collapse':'Manage recipients'}>
                                                                            <Icon name={isExpanded?'chevron-up':'users'} size={13} color={textM} />
                                                                        </button>
                                                                    </div>
                                                                    {isSaving && <div style={{width:'14px',height:'14px',border:`2px solid ${BRAND}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.65s linear infinite',flexShrink:0}} />}
                                                                </div>

                                                                {/* Expanded: recipient management */}
                                                                {isExpanded && (
                                                                    <div style={{borderTop:`1px solid ${borderC}`,padding:'12px 16px',background:dm?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)'}}>
                                                                        <div style={{fontSize:'11px',fontWeight:'700',color:textM,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>
                                                                            Notification Recipients
                                                                        </div>
                                                                        {staffList.length === 0 ? (
                                                                            <div style={{fontSize:'12px',color:textM}}>No staff members found</div>
                                                                        ) : (
                                                                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'6px'}}>
                                                                                {staffList.map(s => {
                                                                                    const checked = recipients.includes(s.id);
                                                                                    return (
                                                                                        <label key={s.id}
                                                                                            style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'7px',border:`1px solid ${checked?group.color+'40':borderC}`,background:checked?`${group.color}08`:'transparent',cursor:'pointer',transition:'all 0.15s'}}>
                                                                                            <input type="checkbox" checked={checked}
                                                                                                onChange={e=>toggleAlertRecipient(cfg.alert_key, s.id, e.target.checked)}
                                                                                                style={{accentColor:group.color,width:'13px',height:'13px',flexShrink:0}} />
                                                                                            <div style={{flex:1,minWidth:0}}>
                                                                                                <div style={{fontSize:'12px',fontWeight:'600',color:textP,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                                                                                                <div style={{fontSize:'10px',color:textM,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.email}</div>
                                                                                            </div>
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                        {recipients.length > 0 && (
                                                                            <div style={{marginTop:'8px',fontSize:'11px',color:textM}}>
                                                                                {recipients.length} recipient{recipients.length!==1?'s':''} selected
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                        {/* ══════════════════════ ANALYTICS TAB ══════════════════════ */}
                        {activeTab === 'analytics' && (() => {
                            const yr = new Date().getFullYear();
                            const total      = vehicles.length;
                            const active     = vehicles.filter(v=>v.status==='active').length;
                            const inSvc      = vehicles.filter(v=>v.status==='in_service').length;
                            const retired    = vehicles.filter(v=>v.status==='retired').length;
                            const assigned   = vehicles.filter(v=>v.assigned_to).length;
                            const unassigned = total - assigned;
                            const ycCount    = vehicles.filter(v=>v.company==='YC').length;
                            const ypcCount   = vehicles.filter(v=>v.company==='YPC').length;
                            const exp30  = vehicles.filter(v=>expiryFlag(v.registration_expiry,30)||expiryFlag(v.insurance_expiry,30)||expiryFlag(v.ctp_expiry,30)||expiryFlag(v.next_service_due,30)).length;
                            const exp14  = vehicles.filter(v=>expiryFlag(v.registration_expiry,14)||expiryFlag(v.insurance_expiry,14)||expiryFlag(v.ctp_expiry,14)||expiryFlag(v.next_service_due,14)).length;
                            const exp7   = vehicles.filter(v=>expiryFlag(v.registration_expiry,7) ||expiryFlag(v.insurance_expiry,7) ||expiryFlag(v.ctp_expiry,7) ||expiryFlag(v.next_service_due,7)).length;
                            const avgAge = total>0 ? (vehicles.filter(v=>v.year).reduce((s,v)=>s+(yr-v.year),0) / Math.max(1,vehicles.filter(v=>v.year).length)).toFixed(1) : '—';
                            const assignRate = total>0 ? Math.round((assigned/total)*100) : 0;

                            // Upcoming expiry items (next 60 days)
                            const upcomingItems = [];
                            vehicles.forEach(v => {
                                const checks = [
                                    { field: 'Registration',           date: v.registration_expiry },
                                    { field: 'Comp. Insurance',        date: v.insurance_expiry },
                                    { field: 'CTP / Green Slip',       date: v.ctp_expiry },
                                    { field: 'Next Service',           date: v.next_service_due },
                                ];
                                checks.forEach(({field, date}) => {
                                    const f = expiryFlag(date, 60);
                                    if (f) upcomingItems.push({ reg: v.registration_number, make: v.make, model: v.model, field, date, flag: f });
                                });
                            });
                            upcomingItems.sort((a,b) => new Date(a.date)-new Date(b.date));

                            const StatCard = ({label, val, sub, color, icon}) => (
                                <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'10px',padding:'14px 16px',display:'flex',gap:'12px',alignItems:'center',flex:'1 1 120px'}}>
                                    <div style={{width:'36px',height:'36px',borderRadius:'9px',background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                        <Icon name={icon} size={16} color={color} />
                                    </div>
                                    <div>
                                        <div style={{fontSize:'22px',fontWeight:'800',color:textP,lineHeight:1}}>{val}</div>
                                        <div style={{fontSize:'11px',fontWeight:'600',color:textM,marginTop:'2px'}}>{label}</div>
                                        {sub && <div style={{fontSize:'10px',color:textM,marginTop:'1px'}}>{sub}</div>}
                                    </div>
                                </div>
                            );

                            const BarRow = ({label, val, max, color}) => {
                                const pct = max > 0 ? Math.round((val/max)*100) : 0;
                                return (
                                    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'7px'}}>
                                        <div style={{width:'110px',fontSize:'12px',color:textP,fontWeight:'500',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</div>
                                        <div style={{flex:1,height:'8px',borderRadius:'4px',background:dm?'#334155':'#E2E8F0',overflow:'hidden'}}>
                                            <div style={{width:`${pct}%`,height:'100%',borderRadius:'4px',background:color,transition:'width 0.4s'}} />
                                        </div>
                                        <div style={{width:'28px',fontSize:'12px',fontWeight:'700',color:textP,textAlign:'right',flexShrink:0}}>{val}</div>
                                    </div>
                                );
                            };

                            return (
                                <div>
                                    {/* Summary stat cards */}
                                    <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'20px'}}>
                                        <StatCard label="Total Fleet"    val={total}      color='#1B75BB' icon='truck'         sub={`avg age ${avgAge} yrs`} />
                                        <StatCard label="Active"         val={active}     color='#5F8F6E' icon='check-circle'  sub={`${total>0?Math.round(active/total*100):0}% of fleet`} />
                                        <StatCard label="In Service"     val={inSvc}      color='#B08D3F' icon='wrench'        sub={`${total>0?Math.round(inSvc/total*100):0}% of fleet`} />
                                        <StatCard label="Retired"        val={retired}    color='#8B93A1' icon='x-circle'      sub={`${total>0?Math.round(retired/total*100):0}% of fleet`} />
                                        <StatCard label="Assigned"       val={assigned}   color='#3B82F6' icon='user'          sub={`${assignRate}% assignment rate`} />
                                        <StatCard label="Unassigned"     val={unassigned} color='#94A3B8' icon='user-x'        sub={`${100-assignRate}% of fleet`} />
                                    </div>

                                    {/* Expiry urgency row */}
                                    <div style={{display:'flex',gap:'10px',marginBottom:'20px',flexWrap:'wrap'}}>
                                        {[
                                            { label:'Expiring in 7 days',  val: exp7,  color:'#DC2626', icon:'alert-triangle' },
                                            { label:'Expiring in 14 days', val: exp14, color:'#B45309', icon:'alert-triangle' },
                                            { label:'Expiring in 30 days', val: exp30, color:'#D97706', icon:'clock' },
                                        ].map(s=>(
                                            <div key={s.label} style={{background:s.val>0?`${s.color}10`:cardBg,border:`1px solid ${s.val>0?s.color+'35':borderC}`,borderRadius:'10px',padding:'12px 16px',display:'flex',gap:'10px',alignItems:'center',flex:'1 1 150px'}}>
                                                <Icon name={s.icon} size={18} color={s.val>0?s.color:textM} />
                                                <div>
                                                    <div style={{fontSize:'20px',fontWeight:'800',color:s.val>0?s.color:textP}}>{s.val}</div>
                                                    <div style={{fontSize:'11px',color:s.val>0?s.color:textM,fontWeight:'600'}}>{s.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Charts row */}
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px',marginBottom:'20px'}}>
                                        {/* Make distribution */}
                                        <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'12px',padding:'16px'}}>
                                            <div style={{fontSize:'12px',fontWeight:'700',color:textP,marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
                                                <Icon name='truck' size={13} color={BRAND} />Fleet by Make
                                            </div>
                                            <canvas ref={makeChartRef} style={{maxHeight:'180px'}} />
                                        </div>
                                        {/* Status doughnut */}
                                        <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'12px',padding:'16px'}}>
                                            <div style={{fontSize:'12px',fontWeight:'700',color:textP,marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
                                                <Icon name='pie-chart' size={13} color={BRAND} />Status Distribution
                                            </div>
                                            <canvas ref={statusChartRef} style={{maxHeight:'180px'}} />
                                        </div>
                                        {/* Fleet age */}
                                        <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'12px',padding:'16px'}}>
                                            <div style={{fontSize:'12px',fontWeight:'700',color:textP,marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
                                                <Icon name='calendar' size={13} color={BRAND} />Fleet Age
                                            </div>
                                            <canvas ref={ageChartRef} style={{maxHeight:'180px'}} />
                                        </div>
                                    </div>

                                    {/* Company + Assignment breakdown */}
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'20px'}}>
                                        <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'12px',padding:'16px'}}>
                                            <div style={{fontSize:'12px',fontWeight:'700',color:textP,marginBottom:'12px'}}>Company Split</div>
                                            <BarRow label="Yahweh Property Care (YPC)" val={ypcCount} max={total} color='#1B75BB' />
                                            <BarRow label="Yahweh Care (YC)"           val={ycCount}  max={total} color='#5F8F6E' />
                                            <BarRow label="Unassigned to company"       val={total-ycCount-ypcCount} max={total} color='#94A3B8' />
                                        </div>
                                        <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'12px',padding:'16px'}}>
                                            <div style={{fontSize:'12px',fontWeight:'700',color:textP,marginBottom:'12px'}}>Assignment Rate</div>
                                            <BarRow label="Assigned to staff"   val={assigned}   max={total} color='#3B82F6' />
                                            <BarRow label="Unassigned"          val={unassigned} max={total} color='#94A3B8' />
                                            <div style={{marginTop:'12px',fontSize:'12px',color:textM}}>
                                                {assignRate}% of the fleet is currently assigned to a staff member.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upcoming expiry table */}
                                    <div style={{background:cardBg,border:`1px solid ${borderC}`,borderRadius:'12px',padding:'16px'}}>
                                        <div style={{fontSize:'12px',fontWeight:'700',color:textP,marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
                                            <Icon name='clock' size={13} color='#D97706' />Upcoming Expirations (next 60 days)
                                            {upcomingItems.length > 0 && <span style={{marginLeft:'auto',fontSize:'11px',fontWeight:'600',color:'#D97706'}}>{upcomingItems.length} item{upcomingItems.length!==1?'s':''}</span>}
                                        </div>
                                        {upcomingItems.length === 0 ? (
                                            <div style={{textAlign:'center',padding:'24px',color:textM,fontSize:'13px'}}>
                                                <Icon name='check-circle' size={24} color='#5F8F6E' />
                                                <div style={{marginTop:'8px'}}>No items expiring in the next 60 days</div>
                                            </div>
                                        ) : (
                                            <div style={{overflowX:'auto'}}>
                                            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px',minWidth:'500px'}}>
                                                <thead>
                                                    <tr style={{borderBottom:`1px solid ${borderC}`,background:dm?'#0F172A':'#F8FAFC'}}>
                                                        {['Vehicle','Type','Expiry Date','Status'].map(h=>(
                                                            <th key={h} style={{padding:'8px 12px',textAlign:'left',fontWeight:'700',color:textM,fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {upcomingItems.map((item,i)=>(
                                                        <tr key={i} style={{borderBottom:`1px solid ${borderC}`}}>
                                                            <td style={{padding:'8px 12px',fontWeight:'600',color:textP}}>{item.reg}<span style={{marginLeft:'6px',fontSize:'10px',color:textM,fontWeight:'400'}}>{item.make} {item.model}</span></td>
                                                            <td style={{padding:'8px 12px',color:textM}}>{item.field}</td>
                                                            <td style={{padding:'8px 12px',color:textP}}>{new Date(item.date).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'})}</td>
                                                            <td style={{padding:'8px 12px'}}>
                                                                <span style={{fontSize:'10px',fontWeight:'700',color:item.flag.color,background:`${item.flag.color}15`,padding:'2px 7px',borderRadius:'5px'}}>{item.flag.label}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                    </div>

                    {/* ── ADD/EDIT VEHICLE MODAL ────────────────────────────── */}
                    {showModal && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
                            <div style={{background:cardBg,borderRadius:'16px',width:'100%',maxWidth:'640px',maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
                                <div style={{padding:'18px 24px',borderBottom:`1px solid ${borderC}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:cardBg,borderRadius:'16px 16px 0 0'}}>
                                    <h2 style={{fontSize:'16px',fontWeight:'700',color:textP,margin:0}}>
                                        <span style={{display:'flex',alignItems:'center',gap:'6px'}}>{modalMode==='add'?<Icon name='plus-circle' size={16} color={BRAND} />:<Icon name='pencil' size={16} color={BRAND} />}{modalMode==='add'?'Add New Vehicle':'Edit Vehicle'}</span>
                                    </h2>
                                    <button onClick={()=>setShowModal(false)} style={{background:'transparent',border:'none',color:textM,borderRadius:'6px',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name='x' size={16} color={textM} /></button>
                                </div>

                                <div style={{padding:'20px 24px'}}>
                                    {error && <div style={{background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',border:`1px solid ${dm?'rgba(239,68,68,0.3)':'#FECACA'}`,borderRadius:'8px',padding:'8px 12px',marginBottom:'14px',fontSize:'12px',color:'#DC2626',display:'flex',alignItems:'center',gap:'6px'}}><Icon name='alert-triangle' size={12} color='#DC2626' />{error}</div>}

                                    <p style={{fontSize:'11px',fontWeight:'800',color:dm?'#C77DB8':'#1B75BB',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px'}}>Vehicle Details</p>
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'20px'}}>
                                        <div>
                                            <label style={labelStyle}>Registration / Plate Number <span style={{color:'#DC2626'}}>*</span></label>
                                            <input style={inputStyle} value={form.registration_number} onChange={e=>setForm(f=>({...f,registration_number:e.target.value.toUpperCase()}))} placeholder="e.g. ABC123"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Year</label>
                                            <input style={inputStyle} type="number" value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} placeholder="e.g. 2022"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Make <span style={{color:'#DC2626'}}>*</span></label>
                                            <input style={inputStyle} value={form.make} onChange={e=>setForm(f=>({...f,make:e.target.value}))} placeholder="e.g. Toyota"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Model <span style={{color:'#DC2626'}}>*</span></label>
                                            <input style={inputStyle} value={form.model} onChange={e=>setForm(f=>({...f,model:e.target.value}))} placeholder="e.g. Hiace"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Colour</label>
                                            <input style={inputStyle} value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} placeholder="e.g. White"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Company</label>
                                            <select style={inputStyle} value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))}>
                                                <option value="">— Select —</option>
                                                <option value="YC">{COMPANY_LABELS.YC}</option>
                                                <option value="YPC">{COMPANY_LABELS.YPC}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Assigned To</label>
                                            {/* Toggle: Staff vs External */}
                                            <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
                                                {['staff','external'].map(t=>(
                                                    <button key={t} type="button"
                                                        onClick={()=>setForm(f=>({...f,assignee_type:t,assigned_to:'',assigned_to_external:''}))}
                                                        style={{flex:1,padding:'5px 0',fontSize:'12px',fontWeight:'600',borderRadius:'7px',cursor:'pointer',
                                                            border:`1px solid ${form.assignee_type===t?BRAND:borderC}`,
                                                            background:form.assignee_type===t?(dm?'rgba(27,117,187,0.18)':'#EFF6FF'):(dm?'#1E293B':'#F8FAFC'),
                                                            color:form.assignee_type===t?BRAND:textM,transition:'all 0.15s'}}>
                                                        {t==='staff'?'Staff Member':'External Person'}
                                                    </button>
                                                ))}
                                            </div>
                                            {form.assignee_type === 'staff' ? (
                                                <select style={inputStyle} value={form.assigned_to} onChange={e=>setForm(f=>({...f,assigned_to:e.target.value}))}>
                                                    <option value="">— Unassigned —</option>
                                                    {staffList.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            ) : (
                                                <input style={inputStyle} type="text" placeholder="Full name of external person"
                                                    value={form.assigned_to_external}
                                                    onChange={e=>setForm(f=>({...f,assigned_to_external:e.target.value}))} />
                                            )}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Status</label>
                                            <select style={inputStyle} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                                                <option value="active">Active</option>
                                                <option value="in_service">In Service</option>
                                                <option value="retired">Retired</option>
                                            </select>
                                        </div>
                                    </div>

                                    <p style={{fontSize:'11px',fontWeight:'800',color:dm?'#C77DB8':'#1B75BB',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px'}}>Registration & Insurance</p>
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'20px'}}>
                                        <div>
                                            <label style={labelStyle}>Registration Expiry</label>
                                            <input style={inputStyle} type="date" value={form.registration_expiry} onChange={e=>setForm(f=>({...f,registration_expiry:e.target.value}))}/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Next Service Due</label>
                                            <input style={inputStyle} type="date" value={form.next_service_due} onChange={e=>setForm(f=>({...f,next_service_due:e.target.value}))}/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Comprehensive Insurer</label>
                                            <input style={inputStyle} value={form.comprehensive_insurer} onChange={e=>setForm(f=>({...f,comprehensive_insurer:e.target.value}))} placeholder="e.g. SSAA Insurance"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Comprehensive Insurance Expiry</label>
                                            <input style={inputStyle} type="date" value={form.insurance_expiry} onChange={e=>setForm(f=>({...f,insurance_expiry:e.target.value}))}/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>CTP / Green Slip Insurer</label>
                                            <input style={inputStyle} value={form.ctp_insurer} onChange={e=>setForm(f=>({...f,ctp_insurer:e.target.value}))} placeholder="e.g. QBE"/>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>CTP / Green Slip Expiry</label>
                                            <input style={inputStyle} type="date" value={form.ctp_expiry} onChange={e=>setForm(f=>({...f,ctp_expiry:e.target.value}))}/>
                                        </div>
                                    </div>

                                    <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'14px'}}>
                                        <div>
                                            <label style={labelStyle}>Notes</label>
                                            <textarea style={{...inputStyle, minHeight:'70px', resize:'vertical'}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any additional notes about this vehicle…"/>
                                        </div>
                                    </div>
                                </div>

                                <div style={{padding:'16px 24px',borderTop:`1px solid ${borderC}`,display:'flex',justifyContent:'flex-end',gap:'10px',background:dm?'#0F172A':'#F8FAFC',borderRadius:'0 0 16px 16px'}}>
                                    <button onClick={()=>setShowModal(false)} style={{padding:'9px 18px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',color:textM,cursor:'pointer'}}>Cancel</button>
                                    <button onClick={handleSave} disabled={saving} style={{padding:'9px 20px',background:BRAND,color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',opacity:saving?0.7:1}}>
                                        {saving ? 'Saving…' : (modalMode==='add'?'Add Vehicle':'Save Changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DELETE CONFIRM ───────────────────────────────────── */}
                    {delConfirm && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{background:cardBg,borderRadius:'14px',width:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}>
                                <div style={{padding:'20px 24px',textAlign:'center'}}>
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='alert-triangle' size={40} color='#EF4444' /></div>
                                    <h3 style={{fontSize:'16px',fontWeight:'700',color:textP,margin:'0 0 8px'}}>Remove Vehicle?</h3>
                                    <p style={{fontSize:'13px',color:textM,margin:'0 0 8px'}}>
                                        <strong>{delConfirm.registration_number}</strong> will be removed from the fleet list.
                                    </p>
                                    <p style={{fontSize:'11px',color:dm?'#4a607f':'#94A3B8'}}>This can be undone by re-adding the vehicle with the same plate number.</p>
                                </div>
                                <div style={{padding:'12px 20px',borderTop:`1px solid ${dm?'rgba(27,117,187,0.10)':'#EEF2F8'}`,display:'flex',gap:'10px',justifyContent:'center',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                                    <button onClick={()=>setDelConfirm(null)} style={{padding:'9px 20px',background:cardBg,border:`1px solid ${borderC}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:textP}}>Cancel</button>
                                    <button onClick={handleDelete} style={{padding:'9px 20px',background:'#DC2626',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Remove</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            );
        });


        // ============================================================
        // EX-STAFF PAGE (Bootstrap Admin only)
        // ============================================================
        // Lists deactivated staff and lets a bootstrap admin reactivate someone
        // who rejoins Yahwehcare. Reuses the PATCH /users/:id {is_active:true}
        // route — the backend already gates activation/deactivation symmetrically
        // to bootstrap admins only (see users.routes.ts).
        const ExStaffPage = React.memo(function ExStaffPage() {
            const dm = React.useContext(DarkModeContext);
            const [staff, setStaff]     = React.useState([]);
            const [loading, setLoading] = React.useState(true);
            const [search, setSearch]   = React.useState('');
            const debouncedSearch = useDebounce(search, 150);
            const [toast, setToast]     = React.useState('');
            const [reactivating, setReactivating] = React.useState(null); // user id in flight
            const [confirmUser, setConfirmUser] = React.useState(null);

            const bg   = dm ? '#0F172A' : '#F9FAFB';
            const card = dm ? '#1E293B' : '#FFFFFF';
            const bdr  = dm ? '#334155' : '#E2E8F0';
            const txt  = dm ? '#E2E8F0' : '#1E293B';
            const muted = dm ? '#94A3B8' : '#6B7280';

            const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

            const fetchExStaff = React.useCallback(async () => {
                setLoading(true);
                try {
                    const res = await authFetch(`${HRMS_API}/users?status=inactive&limit=200`);
                    if (!res.ok) throw new Error('Failed to fetch ex-staff');
                    const data = await res.json();
                    setStaff(data.users || []);
                } catch (e) { showToast('Failed to load ex-staff: ' + e.message); }
                finally { setLoading(false); }
            }, []);

            React.useEffect(() => { fetchExStaff(); }, [fetchExStaff]);

            const filtered = React.useMemo(() => {
                const q = debouncedSearch.toLowerCase();
                if (!q) return staff;
                return staff.filter(s =>
                    s.name?.toLowerCase().includes(q) ||
                    s.email?.toLowerCase().includes(q) ||
                    s.department_name?.toLowerCase().includes(q) ||
                    (s.positions || []).some(p => p.title?.toLowerCase().includes(q))
                );
            }, [staff, debouncedSearch]);

            const handleReactivate = async (u) => {
                setReactivating(u.id);
                try {
                    const res = await authFetch(`${HRMS_API}/users/${u.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ is_active: true }),
                    });
                    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || e.error || 'Reactivation failed'); }
                    setConfirmUser(null);
                    showToast(`${u.name} has been reactivated`);
                    fetchExStaff();
                } catch (e) { showToast('Failed: ' + e.message); }
                finally { setReactivating(null); }
            };

            const Avatar = ({ name, photoUrl, size = 36 }) => {
                const ini = (name || '').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
                if (photoUrl) return <img src={photoUrl} alt="" style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,filter:'grayscale(60%)'}}/>;
                return <div style={{width:size,height:size,borderRadius:'50%',background:'#94A3B8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color:'white',flexShrink:0}}>{ini}</div>;
            };

            return (
                <main style={{flex:1, overflowY:'auto', background:bg, padding:'24px'}}>
                    {toast && (
                        <div style={{position:'fixed',top:20,right:20,background:'#1E293B',color:'#fff',padding:'10px 18px',borderRadius:10,zIndex:9999,fontSize:13,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
                            {toast}
                        </div>
                    )}
                    <div style={{maxWidth:1100, margin:'0 auto'}}>
                        <div style={{marginBottom:24}}>
                            <h1 style={{fontSize:22,fontWeight:800,color:txt,margin:0,display:'flex',alignItems:'center',gap:'8px'}}><Icon name='users-minus' size={22} color={txt} />Ex-Staff</h1>
                            <p style={{fontSize:13,color:muted,margin:'4px 0 0'}}>Staff who no longer work at Yahwehcare. Reactivate someone here if they rejoin. Bootstrap Admin only.</p>
                        </div>

                        <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,overflow:'hidden'}}>
                            <div style={{padding:'14px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name / email / department…"
                                    style={{padding:'7px 10px',borderRadius:6,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:12,width:260}}/>
                                <button onClick={fetchExStaff} style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>↻ Refresh</button>
                                <span style={{marginLeft:'auto',fontSize:12,color:muted}}>{filtered.length} of {staff.length} total</span>
                            </div>
                            <div style={{overflowX:'auto'}}>
                                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                                    <thead>
                                        <tr style={{background:dm?'#0F172A':'#F8FAFC'}}>
                                            {['Staff','Email','Department','Position','Action'].map(h=>(
                                                <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:muted,borderBottom:`1px solid ${bdr}`,whiteSpace:'nowrap'}}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:muted}}>Loading…</td></tr>}
                                        {!loading && !filtered.length && <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:muted}}>No ex-staff found</td></tr>}
                                        {filtered.map(s => (
                                            <tr key={s.id} style={{borderBottom:`1px solid ${bdr}`}}>
                                                <td style={{padding:'9px 14px',color:txt}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                                                        <Avatar name={s.name} photoUrl={s.profile_photo_url} />
                                                        <div>
                                                            <div style={{fontWeight:600}}>{s.name}</div>
                                                            <span style={{fontSize:10,fontWeight:700,color:'#991B1B',background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',padding:'1px 6px',borderRadius:10}}>No longer with Yahwehcare</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{padding:'9px 14px',color:muted}}>{s.email}</td>
                                                <td style={{padding:'9px 14px',color:muted}}>{s.department_name || '—'}</td>
                                                <td style={{padding:'9px 14px',color:muted}}>{(s.positions||[]).map(p=>p.title).join(', ') || '—'}</td>
                                                <td style={{padding:'9px 14px'}}>
                                                    <button onClick={()=>setConfirmUser(s)} disabled={reactivating===s.id}
                                                        style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#10B981',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                                                        {reactivating===s.id ? 'Reactivating…' : 'Reactivate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {confirmUser && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10000}} onClick={()=>setConfirmUser(null)}>
                            <div style={{background:card,borderRadius:12,padding:24,maxWidth:400,width:'90%'}} onClick={e=>e.stopPropagation()}>
                                <h3 style={{margin:'0 0 10px',fontSize:16,fontWeight:700,color:txt}}>Reactivate {confirmUser.name}?</h3>
                                <p style={{fontSize:13,color:muted,margin:'0 0 18px'}}>They will regain access to Yahwehcare and appear in Staff Management again.</p>
                                <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                                    <button onClick={()=>setConfirmUser(null)} style={{padding:'8px 16px',borderRadius:8,border:`1px solid ${bdr}`,background:'transparent',color:txt,cursor:'pointer',fontSize:13}}>Cancel</button>
                                    <button onClick={()=>handleReactivate(confirmUser)} disabled={reactivating===confirmUser.id} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#10B981',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:700}}>
                                        {reactivating===confirmUser.id ? 'Reactivating…' : 'Confirm Reactivate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            );
        });

        // ============================================================
        // ACTIVITY LOG PAGE (Bootstrap Admin only)
        // ============================================================
        // Thin viewer over GET /audit-logs (rbac.middleware.ts now lets
        // isBootstrapAdmin bypass the audit.read permission check).
        const ActivityLogPage = React.memo(function ActivityLogPage() {
            const dm = React.useContext(DarkModeContext);
            const [entries, setEntries] = React.useState([]);
            const [total, setTotal]     = React.useState(0);
            const [loading, setLoading] = React.useState(false);
            const [search, setSearch]   = React.useState('');
            const [searchInput, setSearchInput] = React.useState('');
            const [page, setPage]       = React.useState(1);
            const [toast, setToast]     = React.useState('');
            const [pageSize, setPageSize] = React.useState(25);
            const [tab, setTab]         = React.useState('log'); // 'log' | 'archive'

            // ── Advanced filters (Export Filters requirement) ───────────────
            const emptyFilters = { dateFrom:'', dateTo:'', user:'', role:'', module:'', action:'', ticketNumber:'', status:'', severity:'', ipAddress:'', device:'', success:'' };
            const [filterDraft, setFilterDraft] = React.useState(emptyFilters);
            const [filters, setFilters]         = React.useState(emptyFilters);
            const [showFilters, setShowFilters] = React.useState(false);
            const [exporting, setExporting]     = React.useState('');

            const bg   = dm ? '#0F172A' : '#F9FAFB';
            const card = dm ? '#1E293B' : '#FFFFFF';
            const bdr  = dm ? '#334155' : '#E2E8F0';
            const txt  = dm ? '#E2E8F0' : '#1E293B';
            const muted = dm ? '#94A3B8' : '#6B7280';

            const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

            const buildFilterParams = React.useCallback((extra = {}) => {
                const params = new URLSearchParams(extra);
                if (search) params.set('search', search);
                if (filters.dateFrom)     params.set('since', new Date(filters.dateFrom).toISOString());
                if (filters.dateTo)       params.set('until', new Date(filters.dateTo + 'T23:59:59').toISOString());
                if (filters.user)         params.set('user', filters.user);
                if (filters.role)         params.set('role', filters.role);
                if (filters.module)       params.set('module', filters.module);
                if (filters.action)       params.set('action', filters.action);
                if (filters.ticketNumber) params.set('ticketNumber', filters.ticketNumber);
                if (filters.status)       params.set('status', filters.status);
                if (filters.severity)     params.set('severity', filters.severity);
                if (filters.ipAddress)    params.set('ipAddress', filters.ipAddress);
                if (filters.device)       params.set('device', filters.device);
                if (filters.success)      params.set('success', filters.success);
                return params;
            }, [search, filters]);

            const loadEntries = React.useCallback(async () => {
                setLoading(true);
                try {
                    const params = buildFilterParams({ limit: pageSize, offset: (page - 1) * pageSize });
                    const res = await authFetch(`${HRMS_API}/audit-logs?${params}`);
                    if (!res.ok) throw new Error('Failed to fetch activity log');
                    const d = await res.json();
                    setEntries(d.entries || []);
                    setTotal(d.total || 0);
                } catch (e) { showToast('Failed to load activity log: ' + e.message); }
                finally { setLoading(false); }
            }, [page, pageSize, buildFilterParams]);

            React.useEffect(() => { if (tab === 'log') loadEntries(); }, [loadEntries, tab]);

            const runSearch = () => { setPage(1); setSearch(searchInput.trim()); };
            const applyFilters = () => { setPage(1); setFilters(filterDraft); setShowFilters(false); };
            const clearFilters = () => { setFilterDraft(emptyFilters); setFilters(emptyFilters); setPage(1); };
            const activeFilterCount = Object.values(filters).filter(Boolean).length;

            const handleExport = async (format) => {
                setExporting(format);
                try {
                    const params = buildFilterParams({ format });
                    const res = await authFetch(`${HRMS_API}/audit-logs/export?${params}`);
                    if (!res.ok) { const t = await res.text(); throw new Error(t || 'Export failed'); }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = Object.assign(document.createElement('a'), { href: url, download: `activity-log-${new Date().toISOString().slice(0,10)}.${format}` });
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast(`${format.toUpperCase()} export downloaded`);
                } catch (e) { showToast('Export failed: ' + e.message); }
                finally { setExporting(''); }
            };

            // ── Manual, filtered deletion (delete what you'd export) ─────────
            const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
            const [deleteAck, setDeleteAck]                 = React.useState(false);
            const [deleting, setDeleting]                   = React.useState(false);
            const noFiltersApplied = activeFilterCount === 0 && !search;

            const handleDeleteFiltered = async () => {
                setDeleting(true);
                try {
                    const extra = { confirm: 'true' };
                    if (noFiltersApplied) extra.confirmAll = 'true';
                    const params = buildFilterParams(extra);
                    const res = await authFetch(`${HRMS_API}/audit-logs?${params}`, { method: 'DELETE' });
                    const d = await res.json();
                    if (!res.ok) throw new Error(d.message || d.error || 'Delete failed');
                    showToast(`Deleted ${d.deletedCount} record${d.deletedCount!==1?'s':''}`);
                    setDeleteConfirmOpen(false); setDeleteAck(false);
                    setPage(1);
                    loadEntries();
                } catch (e) { showToast('Delete failed: ' + e.message); }
                finally { setDeleting(false); }
            };

            // ── Manual Quarterly Archive workflow ────────────────────────────
            const defaultQuarter = React.useMemo(() => {
                const now = new Date();
                const y = now.getFullYear(), m = now.getMonth();
                const curFyYear  = m >= 6 ? y + 1 : y;
                const curQuarter = (m >= 6 && m <= 8) ? 1 : m >= 9 ? 2 : m <= 2 ? 3 : 4;
                let fyYear = curFyYear, quarter = curQuarter - 1;
                if (quarter < 1) { quarter = 4; fyYear = curFyYear - 1; }
                return { fyYear, quarter };
            }, []);
            const [archiveFyYear, setArchiveFyYear]   = React.useState(defaultQuarter.fyYear);
            const [archiveQuarter, setArchiveQuarter] = React.useState(defaultQuarter.quarter);
            const [archives, setArchives]             = React.useState([]);
            const [archiveLoading, setArchiveLoading] = React.useState(false);
            const [generating, setGenerating]         = React.useState(false);
            const [emailingId, setEmailingId]         = React.useState(null);
            const [truncateTarget, setTruncateTarget] = React.useState(null);
            const [truncateAck, setTruncateAck]       = React.useState(false);
            const [truncating, setTruncating]         = React.useState(false);

            const loadArchives = React.useCallback(async () => {
                setArchiveLoading(true);
                try {
                    const res = await authFetch(`${HRMS_API}/audit-logs/archives`);
                    if (!res.ok) throw new Error('Failed to load archives');
                    const d = await res.json();
                    setArchives(d.archives || []);
                } catch (e) { showToast('Failed to load archives: ' + e.message); }
                finally { setArchiveLoading(false); }
            }, []);

            // Load once on mount (not just when the Archive tab is opened) so the
            // Activity Log tab's Delete button can gate itself on whether any
            // period has been archived + emailed yet; also refreshed by the
            // generate/email/truncate handlers below so the gate updates live.
            React.useEffect(() => { loadArchives(); }, [loadArchives]);
            const hasArchivedPeriod = archives.some(a => a.email_status === 'sent');

            const handleGenerateArchive = async () => {
                setGenerating(true);
                try {
                    const res = await authFetch(`${HRMS_API}/audit-logs/archive/generate`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fyYear: Number(archiveFyYear), quarter: Number(archiveQuarter) }),
                    });
                    const d = await res.json();
                    if (!res.ok) throw new Error(d.message || d.error || 'Generation failed');
                    showToast(`Archive generated — ${d.archive.recordCount} records`);
                    loadArchives();
                } catch (e) { showToast('Generate failed: ' + e.message); }
                finally { setGenerating(false); }
            };

            const handleDownloadArchive = async (a) => {
                try {
                    const res = await authFetch(`${HRMS_API}/audit-logs/archives/${a.id}/download`);
                    if (!res.ok) throw new Error('Download failed');
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const link = Object.assign(document.createElement('a'), { href: url, download: a.filename });
                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                } catch (e) { showToast('Download failed: ' + e.message); }
            };

            const handleEmailArchive = async (a) => {
                setEmailingId(a.id);
                try {
                    const res = await authFetch(`${HRMS_API}/audit-logs/archives/${a.id}/email`, { method: 'POST' });
                    const d = await res.json();
                    if (!res.ok || !d.ok) throw new Error(d.message || d.error || 'Email failed');
                    showToast(`Emailed to ${d.recipients.length} Bootstrap Admin${d.recipients.length!==1?'s':''}`);
                    loadArchives();
                } catch (e) { showToast('Email failed: ' + e.message); }
                finally { setEmailingId(null); }
            };

            const confirmTruncate = async () => {
                if (!truncateTarget) return;
                setTruncating(true);
                try {
                    const res = await authFetch(`${HRMS_API}/audit-logs/archives/${truncateTarget.id}/truncate`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: true }),
                    });
                    const d = await res.json();
                    if (!res.ok) throw new Error(d.message || d.error || 'Truncate failed');
                    showToast(`Truncated ${d.truncatedCount} record${d.truncatedCount!==1?'s':''}`);
                    setTruncateTarget(null); setTruncateAck(false);
                    loadArchives();
                    if (tab === 'log') loadEntries();
                } catch (e) { showToast('Truncate failed: ' + e.message); }
                finally { setTruncating(false); }
            };

            const inputStyle = { padding:'7px 10px',borderRadius:6,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:12,width:'100%',boxSizing:'border-box' };
            const labelStyle = { fontSize:11,fontWeight:600,color:muted,display:'block',marginBottom:4 };

            return (
                <main style={{flex:1, overflowY:'auto', background:bg, padding:'24px'}}>
                    {toast && (
                        <div style={{position:'fixed',top:20,right:20,background:'#1E293B',color:'#fff',padding:'10px 18px',borderRadius:10,zIndex:9999,fontSize:13,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
                            {toast}
                        </div>
                    )}
                    <div style={{maxWidth:1200, margin:'0 auto'}}>
                        <div style={{marginBottom:24}}>
                            <h1 style={{fontSize:22,fontWeight:800,color:txt,margin:0,display:'flex',alignItems:'center',gap:'8px'}}><Icon name='activity' size={22} color={txt} />Activity Log</h1>
                            <p style={{fontSize:13,color:muted,margin:'4px 0 0'}}>Every recorded action across the system — logins, staff changes, ticket events, and more. Bootstrap Admin only.</p>
                        </div>

                        <div style={{display:'flex',gap:8,marginBottom:16}}>
                            {[['log','Activity Log'],['archive','Quarterly Archive']].map(([id,label]) => (
                                <button key={id} onClick={() => setTab(id)} style={{
                                    padding:'8px 18px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight: tab === id ? 700 : 500,
                                    background: tab === id ? '#6D2773' : (dm ? '#1E293B' : '#F3F4F6'),
                                    color: tab === id ? '#fff' : muted,
                                }}>{label}</button>
                            ))}
                        </div>

                        {tab === 'log' && (
                        <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,overflow:'hidden'}}>
                            <div style={{padding:'14px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                                <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
                                    onKeyDown={e=>e.key==='Enter' && runSearch()}
                                    placeholder="Search by user, action, module, target…"
                                    style={{padding:'7px 10px',borderRadius:6,border:`1px solid ${bdr}`,background:bg,color:txt,fontSize:12,width:280}}/>
                                <button onClick={runSearch} style={{padding:'7px 16px',borderRadius:6,border:'none',background:'#6D2773',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>Search</button>
                                {(search || activeFilterCount > 0) && (
                                    <button onClick={()=>{setSearchInput('');setSearch('');clearFilters();}} style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>Clear All</button>
                                )}
                                <button onClick={()=>setShowFilters(s=>!s)} style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${bdr}`,background: showFilters ? (dm?'rgba(109,39,115,0.15)':'#F6ECF4') : 'transparent',color: showFilters ? '#6D2773' : muted,fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontWeight:activeFilterCount>0?700:500}}>
                                    <Icon name='filter' size={12} color={showFilters?'#6D2773':muted} />Filters{activeFilterCount>0?` (${activeFilterCount})`:''}
                                </button>
                                <button onClick={loadEntries} style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>↻ Refresh</button>
                                <span style={{marginLeft:'auto',fontSize:12,color:muted}}>{total} total</span>
                            </div>

                            {showFilters && (
                                <div style={{padding:'16px',borderBottom:`1px solid ${bdr}`,background:dm?'#16213A':'#F8FAFC'}}>
                                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))',gap:10}}>
                                        <div><label style={labelStyle}>Date From</label><input type="date" value={filterDraft.dateFrom} onChange={e=>setFilterDraft(f=>({...f,dateFrom:e.target.value}))} style={inputStyle}/></div>
                                        <div><label style={labelStyle}>Date To</label><input type="date" value={filterDraft.dateTo} onChange={e=>setFilterDraft(f=>({...f,dateTo:e.target.value}))} style={inputStyle}/></div>
                                        <div><label style={labelStyle}>User</label><input value={filterDraft.user} onChange={e=>setFilterDraft(f=>({...f,user:e.target.value}))} placeholder="Name or email" style={inputStyle}/></div>
                                        <div>
                                            <label style={labelStyle}>User Role</label>
                                            <select value={filterDraft.role} onChange={e=>setFilterDraft(f=>({...f,role:e.target.value}))} style={inputStyle}>
                                                <option value="">Any role</option>
                                                {['super_admin','admin','hr','manager','employee','staff'].map(r=><option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div><label style={labelStyle}>Module / Activity Type</label><input value={filterDraft.module} onChange={e=>setFilterDraft(f=>({...f,module:e.target.value}))} placeholder="e.g. auth, tickets, users" style={inputStyle}/></div>
                                        <div><label style={labelStyle}>Action</label><input value={filterDraft.action} onChange={e=>setFilterDraft(f=>({...f,action:e.target.value}))} placeholder="e.g. user.create, login.success" style={inputStyle}/></div>
                                        <div><label style={labelStyle}>Ticket Number</label><input value={filterDraft.ticketNumber} onChange={e=>setFilterDraft(f=>({...f,ticketNumber:e.target.value}))} placeholder="e.g. 24" style={inputStyle}/></div>
                                        <div><label style={labelStyle}>Status</label><input value={filterDraft.status} onChange={e=>setFilterDraft(f=>({...f,status:e.target.value}))} placeholder="e.g. open, closed" style={inputStyle}/></div>
                                        <div>
                                            <label style={labelStyle}>Severity</label>
                                            <select value={filterDraft.severity} onChange={e=>setFilterDraft(f=>({...f,severity:e.target.value}))} style={inputStyle}>
                                                <option value="">Any severity</option>
                                                {['critical','high','medium','low'].map(s=><option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div><label style={labelStyle}>IP Address</label><input value={filterDraft.ipAddress} onChange={e=>setFilterDraft(f=>({...f,ipAddress:e.target.value}))} placeholder="e.g. 10.0.0" style={inputStyle}/></div>
                                        <div><label style={labelStyle}>Device / Browser <span style={{opacity:0.6}}>(optional)</span></label><input value={filterDraft.device} onChange={e=>setFilterDraft(f=>({...f,device:e.target.value}))} placeholder="e.g. Chrome, iPhone" style={inputStyle}/></div>
                                        <div>
                                            <label style={labelStyle}>Success / Failure</label>
                                            <select value={filterDraft.success} onChange={e=>setFilterDraft(f=>({...f,success:e.target.value}))} style={inputStyle}>
                                                <option value="">Any</option>
                                                <option value="success">Success</option>
                                                <option value="failure">Failure</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{display:'flex',gap:8,marginTop:14}}>
                                        <button onClick={applyFilters} style={{padding:'8px 18px',borderRadius:6,border:'none',background:'#6D2773',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>Apply Filters</button>
                                        <button onClick={()=>{setFilterDraft(emptyFilters);}} style={{padding:'8px 16px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>Reset</button>
                                    </div>
                                </div>
                            )}

                            <div style={{padding:'10px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',background:dm?'#111C33':'#FBFCFE'}}>
                                <span style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.05em'}}>Export:</span>
                                {['csv','json','txt'].map(fmt => (
                                    <button key={fmt} onClick={()=>handleExport(fmt)} disabled={!!exporting} style={{padding:'6px 14px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:txt,fontSize:12,fontWeight:600,cursor:exporting?'default':'pointer',display:'flex',alignItems:'center',gap:5,opacity:exporting&&exporting!==fmt?0.5:1}}>
                                        <Icon name='download' size={11} color={txt} />{exporting===fmt ? 'Exporting…' : fmt.toUpperCase()}
                                    </button>
                                ))}
                                <span style={{fontSize:11,color:muted,marginLeft:6}}>Applies current search + filters</span>
                                <button
                                    onClick={()=>{ if (hasArchivedPeriod) { setDeleteConfirmOpen(true); setDeleteAck(false); } }}
                                    disabled={!!exporting || total===0 || !hasArchivedPeriod}
                                    title={hasArchivedPeriod ? 'Delete entries matching your filters — only entries already covered by an archived + emailed Quarterly Archive can be deleted' : 'No period has been archived and emailed yet — generate and email a Quarterly Archive first'}
                                    style={{marginLeft:'auto',padding:'6px 14px',borderRadius:6,border:`1px solid ${dm?'rgba(239,68,68,0.4)':'#FECACA'}`,background:'transparent',color:'#EF4444',fontSize:12,fontWeight:600,cursor:(total===0||!hasArchivedPeriod)?'default':'pointer',display:'flex',alignItems:'center',gap:5,opacity:(total===0||!hasArchivedPeriod)?0.4:1}}>
                                    <Icon name='trash-2' size={11} color='#EF4444' />Delete{activeFilterCount>0||search?' Filtered':''}
                                </button>
                            </div>

                            <div style={{overflowX:'auto'}}>
                                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                                    <thead>
                                        <tr style={{background:dm?'#0F172A':'#F8FAFC'}}>
                                            {['Time','User','Action','Module','Target','Result'].map(h=>(
                                                <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:muted,borderBottom:`1px solid ${bdr}`,whiteSpace:'nowrap'}}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && <tr><td colSpan={6} style={{padding:24,textAlign:'center',color:muted}}>Loading…</td></tr>}
                                        {!loading && !entries.length && <tr><td colSpan={6} style={{padding:24,textAlign:'center',color:muted}}>No activity found</td></tr>}
                                        {entries.map(e => (
                                            <tr key={e.id} style={{borderBottom:`1px solid ${bdr}`}}>
                                                <td style={{padding:'9px 14px',color:muted,whiteSpace:'nowrap'}}>{e.created_at ? new Date(e.created_at).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                                                <td style={{padding:'9px 14px',color:txt,whiteSpace:'nowrap'}}>{e.user_name || e.actor_email || '—'}</td>
                                                <td style={{padding:'9px 14px',color:txt}}><code style={{fontSize:11}}>{e.action}</code></td>
                                                <td style={{padding:'9px 14px',color:muted}}>{e.module || '—'}</td>
                                                <td style={{padding:'9px 14px',color:muted}}>{e.target_type ? `${e.target_type}${e.target_id ? ' #' + e.target_id : ''}` : '—'}</td>
                                                <td style={{padding:'9px 14px'}}>
                                                    <span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:700,
                                                        background: e.success===false ? (dm?'rgba(239,68,68,0.12)':'#FEF2F2') : (dm?'rgba(16,185,129,0.12)':'#ECFDF5'),
                                                        color: e.success===false ? '#EF4444' : '#10B981'}}>
                                                        {e.success===false ? 'Failed' : 'Success'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <PageBar page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize}
                                total={total} itemLabel='entry' itemLabelPlural='entries' dm={dm} bg={bg} border={bdr} muted={muted} />
                        </div>
                        )}

                        {tab === 'archive' && (
                        <div>
                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,padding:20,marginBottom:20}}>
                                <p style={{fontSize:13,fontWeight:700,color:txt,margin:'0 0 4px'}}>Generate Quarterly Archive</p>
                                <p style={{fontSize:12,color:muted,margin:'0 0 14px'}}>Extracts the full, unfiltered Activity Log for an Australian Financial Quarter into a CSV + JSON + TXT ZIP bundle. This never runs automatically.</p>
                                <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
                                    <div><label style={labelStyle}>Financial Year</label><input type="number" value={archiveFyYear} onChange={e=>setArchiveFyYear(e.target.value)} style={{...inputStyle,width:110}}/></div>
                                    <div>
                                        <label style={labelStyle}>Quarter</label>
                                        <select value={archiveQuarter} onChange={e=>setArchiveQuarter(e.target.value)} style={{...inputStyle,width:170}}>
                                            <option value={1}>Q1 (Jul–Sep)</option>
                                            <option value={2}>Q2 (Oct–Dec)</option>
                                            <option value={3}>Q3 (Jan–Mar)</option>
                                            <option value={4}>Q4 (Apr–Jun)</option>
                                        </select>
                                    </div>
                                    <button onClick={handleGenerateArchive} disabled={generating} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#6D2773',color:'#fff',fontWeight:600,cursor:generating?'default':'pointer',fontSize:13}}>
                                        {generating ? 'Generating…' : `Generate Archive (Activity_Log_AU_FY${archiveFyYear}_Q${archiveQuarter}.zip)`}
                                    </button>
                                </div>
                            </div>

                            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:12,overflow:'hidden'}}>
                                <div style={{padding:'14px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',alignItems:'center'}}>
                                    <span style={{fontSize:13,fontWeight:700,color:txt}}>Generated Archives</span>
                                    <button onClick={loadArchives} style={{marginLeft:'auto',padding:'6px 12px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:muted,fontSize:12,cursor:'pointer'}}>↻ Refresh</button>
                                </div>
                                <div style={{overflowX:'auto'}}>
                                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                                        <thead>
                                            <tr style={{background:dm?'#0F172A':'#F8FAFC'}}>
                                                {['Period','Filename','Records','Generated','Email','Truncated','Actions'].map(h=>(
                                                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:muted,borderBottom:`1px solid ${bdr}`,whiteSpace:'nowrap'}}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archiveLoading && <tr><td colSpan={7} style={{padding:24,textAlign:'center',color:muted}}>Loading…</td></tr>}
                                            {!archiveLoading && !archives.length && <tr><td colSpan={7} style={{padding:24,textAlign:'center',color:muted}}>No archives generated yet</td></tr>}
                                            {archives.map(a => (
                                                <tr key={a.id} style={{borderBottom:`1px solid ${bdr}`}}>
                                                    <td style={{padding:'9px 14px',color:txt,whiteSpace:'nowrap'}}>FY{a.fy_year} Q{a.quarter}</td>
                                                    <td style={{padding:'9px 14px',color:muted,whiteSpace:'nowrap'}}><code style={{fontSize:11}}>{a.filename}</code></td>
                                                    <td style={{padding:'9px 14px',color:txt}}>{a.record_count}</td>
                                                    <td style={{padding:'9px 14px',color:muted,whiteSpace:'nowrap'}}>{a.generated_at ? new Date(a.generated_at).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                                                    <td style={{padding:'9px 14px'}}>
                                                        {a.email_status === 'sent' && <span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:700,background:dm?'rgba(16,185,129,0.12)':'#ECFDF5',color:'#10B981'}}>Sent</span>}
                                                        {a.email_status === 'failed' && <span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:700,background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',color:'#EF4444'}}>Failed</span>}
                                                        {!a.email_status && <span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:700,background:dm?'rgba(107,114,128,0.15)':'#F3F4F6',color:muted}}>Not Sent</span>}
                                                    </td>
                                                    <td style={{padding:'9px 14px'}}>
                                                        {a.truncated_at
                                                            ? <span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:700,background:dm?'rgba(107,114,128,0.15)':'#F3F4F6',color:muted}}>Truncated ({a.truncated_count})</span>
                                                            : <span style={{fontSize:11,color:muted}}>—</span>}
                                                    </td>
                                                    <td style={{padding:'9px 14px',whiteSpace:'nowrap'}}>
                                                        <div style={{display:'flex',gap:6}}>
                                                            <button title="Download ZIP" onClick={()=>handleDownloadArchive(a)} style={{padding:'5px 8px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',cursor:'pointer'}}><Icon name='download' size={12} color={txt} /></button>
                                                            <button title="Email to all Bootstrap Admins" onClick={()=>handleEmailArchive(a)} disabled={emailingId===a.id} style={{padding:'5px 8px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',cursor:emailingId===a.id?'default':'pointer'}}><Icon name='mail' size={12} color={txt} /></button>
                                                            <button title={a.email_status==='sent' && !a.truncated_at ? 'Truncate archived rows' : (a.truncated_at ? 'Already truncated' : 'Must be emailed successfully first')}
                                                                onClick={()=>{ if (a.email_status==='sent' && !a.truncated_at) { setTruncateTarget(a); setTruncateAck(false); } }}
                                                                disabled={a.email_status!=='sent' || !!a.truncated_at}
                                                                style={{padding:'5px 8px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',cursor:(a.email_status==='sent' && !a.truncated_at)?'pointer':'default',opacity:(a.email_status==='sent' && !a.truncated_at)?1:0.35}}>
                                                                <Icon name='trash-2' size={12} color='#DC2626' />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* ── TRUNCATE CONFIRM ───────────────────────────────────── */}
                    {truncateTarget && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{background:card,borderRadius:'14px',width:'440px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}>
                                <div style={{padding:'20px 24px',textAlign:'center'}}>
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='trash-2' size={40} color='#EF4444' /></div>
                                    <h3 style={{fontSize:'16px',fontWeight:'700',color:txt,margin:'0 0 8px'}}>Truncate Activity Log?</h3>
                                    <p style={{fontSize:'13px',color:muted,margin:'0 0 8px'}}>
                                        This will <strong>permanently delete {truncateTarget.record_count} record{truncateTarget.record_count!==1?'s':''}</strong> from the Activity Log for <strong>FY{truncateTarget.fy_year} Q{truncateTarget.quarter}</strong> — the exact period covered by <code style={{fontSize:11}}>{truncateTarget.filename}</code>.
                                    </p>
                                    <p style={{fontSize:'12px',color:'#DC2626',background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',padding:'8px',borderRadius:'6px',margin:'0 0 12px'}}>
                                        This action cannot be undone. Only the ZIP archive will remain as a record of this period.
                                    </p>
                                    <label style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:12,color:txt,textAlign:'left',cursor:'pointer'}}>
                                        <input type="checkbox" checked={truncateAck} onChange={e=>setTruncateAck(e.target.checked)} style={{marginTop:2}}/>
                                        I confirm the archive has been generated, emailed to all Bootstrap Administrators, and safely retained.
                                    </label>
                                </div>
                                <div style={{padding:'12px 20px',borderTop:`1px solid ${bdr}`,display:'flex',gap:'10px',justifyContent:'center',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                                    <button onClick={()=>{setTruncateTarget(null);setTruncateAck(false);}} style={{padding:'9px 20px',background:card,border:`2px solid ${bdr}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:txt}}>Cancel</button>
                                    <button onClick={confirmTruncate} disabled={!truncateAck || truncating} style={{padding:'9px 20px',background: !truncateAck ? (dm?'#4b1113':'#FCA5A5') : '#DC2626',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:(!truncateAck||truncating)?'default':'pointer'}}>
                                        {truncating ? 'Truncating…' : 'Truncate Permanently'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DELETE FILTERED CONFIRM ─────────────────────────────── */}
                    {deleteConfirmOpen && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{background:card,borderRadius:'14px',width:'440px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}>
                                <div style={{padding:'20px 24px',textAlign:'center'}}>
                                    <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}><Icon name='trash-2' size={40} color='#EF4444' /></div>
                                    <h3 style={{fontSize:'16px',fontWeight:'700',color:txt,margin:'0 0 8px'}}>Delete Archived Activity Log Entries?</h3>
                                    <p style={{fontSize:'13px',color:muted,margin:'0 0 8px'}}>
                                        Up to <strong>{total} record{total!==1?'s':''}</strong> match your current search and filters. Only the ones already covered by a <strong>generated + emailed Quarterly Archive</strong> will actually be permanently deleted — anything not yet archived is left untouched, no matter what you filter by.
                                    </p>
                                    {noFiltersApplied && (
                                        <p style={{fontSize:'12px',color:'#DC2626',background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',padding:'8px',borderRadius:'6px',margin:'0 0 8px'}}>
                                            No search or filters are applied — this will delete every archived entry across every emailed Quarterly Archive.
                                        </p>
                                    )}
                                    <p style={{fontSize:'12px',color:'#DC2626',background:dm?'rgba(239,68,68,0.12)':'#FEF2F2',padding:'8px',borderRadius:'6px',margin:'0 0 12px'}}>
                                        This action cannot be undone. The ZIP archive(s) will remain as the record of these entries.
                                    </p>
                                    <label style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:12,color:txt,textAlign:'left',cursor:'pointer'}}>
                                        <input type="checkbox" checked={deleteAck} onChange={e=>setDeleteAck(e.target.checked)} style={{marginTop:2}}/>
                                        I confirm I want to permanently delete these Activity Log entries.
                                    </label>
                                </div>
                                <div style={{padding:'12px 20px',borderTop:`1px solid ${bdr}`,display:'flex',gap:'10px',justifyContent:'center',background:dm?'rgba(4,8,20,0.6)':'#F8FAFF'}}>
                                    <button onClick={()=>{setDeleteConfirmOpen(false);setDeleteAck(false);}} style={{padding:'9px 20px',background:card,border:`2px solid ${bdr}`,borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:txt}}>Cancel</button>
                                    <button onClick={handleDeleteFiltered} disabled={!deleteAck || deleting} style={{padding:'9px 20px',background: !deleteAck ? (dm?'#4b1113':'#FCA5A5') : '#DC2626',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:(!deleteAck||deleting)?'default':'pointer'}}>
                                        {deleting ? 'Deleting…' : 'Delete Permanently'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            );
        });

        // isMobile — module-level, stable reference (not recreated per render)
        const isMobile = () => window.innerWidth < 1024;

        // Main App
        function App() {
            const [isPending, startTransition] = React.useTransition();
            const [currentPage, setCurrentPage] = React.useState(() => {
                const hash = window.location.hash.slice(1) || 'dashboard';
                // 'logout' is a public page — keep it; everything else defaults to dashboard if no hash
                return hash;
            });
            // Wrap page navigation in startTransition so urgent updates (clicks) aren't blocked
            const navigatePage = React.useCallback((page) => {
                startTransition(() => setCurrentPage(page));
            }, []);
            const [signedOut,   setSignedOut]   = React.useState(false);
            const [authError,   setAuthError]   = React.useState(null);
            const [sidebarOpen, setSidebarOpen] = React.useState(() => !isMobile());
            const [mobileOverlay, setMobileOverlay] = React.useState(false);

            // Track viewport to toggle overlay mode (debounced 100ms)
            React.useEffect(() => {
                let timer;
                const onResize = () => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        if (!isMobile()) { setMobileOverlay(false); }
                        else { setSidebarOpen(false); }
                    }, 100);
                };
                window.addEventListener('resize', onResize);
                return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
            }, []);

            // When sidebar opens on mobile, show overlay; on desktop keep inline
            const handleSidebarToggle = () => {
                if (isMobile()) {
                    setMobileOverlay(o => !o);
                } else {
                    setSidebarOpen(o => !o);
                }
            };
            const closeMobileNav = () => setMobileOverlay(false);
            const [darkMode,    setDarkMode]    = React.useState(() => {
                try { return localStorage.getItem('yc_dark') === '1'; } catch(e) { return false; }
            });
            const [currentUser, setCurrentUser] = React.useState(() => {
                // Seed from sessionStorage — set by init script after Microsoft login redirect
                try {
                    const stored = sessionStorage.getItem('ms_current_user');
                    return stored ? JSON.parse(stored) : null;
                } catch(e) { return null; }
            });

            // ── Hydrate full profile (photo + extras) from /users/me after login ─
            // profile_photo_url is NOT included in the login redirect URL (it's a
            // base64 JPEG that would make the URL too long and get truncated).
            // Fetch it once from the API after the user object is available.
            React.useEffect(() => {
                if (!currentUser) return;
                // Only fetch if photo is missing — avoids re-fetching on every render
                if (currentUser.profile_photo_url) return;
                authFetch(`${HRMS_API}/users/me`, { noRedirect: true })
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        if (!data?.user?.profile_photo_url) return;
                        setCurrentUser(u => {
                            if (!u) return u;
                            const merged = { ...u, profile_photo_url: data.user.profile_photo_url };
                            try { sessionStorage.setItem('ms_current_user', JSON.stringify(merged)); } catch(_) {}
                            return merged;
                        });
                    })
                    .catch(() => {}); // non-critical — app works fine without photo
            }, [currentUser?.id]); // re-run only when the logged-in user changes

            // Listen for self-service profile edits (e.g. a new profile photo saved on the
            // Settings page) so the sidebar avatar updates immediately without a full reload.
            // Settings page dispatches this after a successful PATCH /users/me.
            React.useEffect(() => {
                const onProfilePatched = (e) => {
                    setCurrentUser(u => {
                        if (!u) return u;
                        const merged = { ...u, ...(e.detail || {}) };
                        try { sessionStorage.setItem('ms_current_user', JSON.stringify(merged)); } catch(err) {}
                        return merged;
                    });
                };
                window.addEventListener('yc:profile-updated', onProfilePatched);
                return () => window.removeEventListener('yc:profile-updated', onProfilePatched);
            }, []);

            // Persist dark mode preference & apply to document
            React.useEffect(() => {
                try { localStorage.setItem('yc_dark', darkMode ? '1' : '0'); } catch(e) {}
                document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
                // Toggle html.dark class — drives all CSS dark-mode overrides
                document.documentElement.classList.toggle('dark', darkMode);
                // Also toggle body class for Tailwind bg-gray-50
                document.body.classList.toggle('bg-gray-900', darkMode);
                document.body.classList.toggle('bg-gray-50', !darkMode);
            }, [darkMode]);

            // Show any error the backend passed back via ?error= after Microsoft login
            React.useEffect(() => {
                if (window.MicrosoftAuth.loginError) {
                    const msgs = {
                        not_authorized:    'Your Microsoft account is not authorised for this app. Contact your administrator.',
                        disallowed_domain: 'Your email domain is not allowed. Contact your administrator.',
                        account_inactive:  'Your account is inactive. Contact your administrator.',
                        session_expired:   'Your session has expired. Please sign in again.',
                    };
                    setAuthError(msgs[window.MicrosoftAuth.loginError] || ('Sign-in error: ' + window.MicrosoftAuth.loginError));
                    setSignedOut(true);
                }
            }, []);

            React.useEffect(() => {
                const handleHashChange = () => {
                    const hash = window.location.hash.slice(1) || 'dashboard';
                    navigatePage(hash);
                };
                window.addEventListener('hashchange', handleHashChange);
                return () => window.removeEventListener('hashchange', handleHashChange);
            }, [navigatePage]);

            const handlePageChange = (pageId) => {
                window.location.hash = pageId;
            };

            // Sign Out — revoke backend session, clear local state (does NOT sign out from Microsoft Entra)
            const handleSignOut = () => {
                const BACKEND = window.location.hostname === 'localhost' ? 'http://localhost:4001' : 'https://yahweahcare-tkt-mgmt-hx48.vercel.app';
                fetch(BACKEND + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
                try { sessionStorage.removeItem('ms_current_user'); } catch(e) {}
                try { sessionStorage.clear(); } catch(e) {}
                try { localStorage.removeItem('authToken'); } catch(e) {}
                setCurrentUser(null);
                setAuthError(null);
                setSignedOut(false);
                window.location.hash = 'logout';
                navigatePage('logout');
            };

            // ── Silent token refresh ─────────────────────────────────────────────
            // Access token lives 15 minutes. Refresh every 13 min via cookie+Bearer.
            // refreshAccessToken() also updates sessionStorage so Bearer header stays fresh.
            React.useEffect(() => {
                if (!currentUser) return;
                refreshAccessToken(); // once immediately on login
                const t = setInterval(refreshAccessToken, 13 * 60 * 1000);
                return () => clearInterval(t);
            }, [currentUser]);

            // ── Session heartbeat ────────────────────────────────────────────────
            // The backend revokes sessions after 30 min of inactivity (no authenticated calls).
            // Ping /auth/me every 20 min to keep the session alive while the page is open.
            React.useEffect(() => {
                if (!currentUser) return;
                const ping = () => {
                    fetch(`${HRMS_API}/auth/me`, {
                        credentials: 'include',
                        headers: authHeaders(),
                    }).catch(() => {}); // silent — just keeping the session alive
                };
                const hb = setInterval(ping, 20 * 60 * 1000);
                return () => clearInterval(hb);
            }, [currentUser]);

            // Sign Back In — redirect to backend which handles PKCE with Microsoft
            const handleSignBackIn = () => {
                setAuthError(null);
                window.MicrosoftAuth.signIn();
            };

            // ── Global ticket cache ───────────────────────────────────────────
            const [ticketCache, setTicketCache] = React.useState({ tickets: [], ready: false });
            const refreshTicketCache = React.useCallback(async () => {
                if (!currentUser) return;
                try {
                    const su  = getSessionUser();
                    const tsp = getTicketScopeParams(su);
                    const tp  = new URLSearchParams({ all:'1', limit:'500' });
                    if (tsp.scope)  tp.set('scope',  tsp.scope);
                    if (tsp.userId) tp.set('userId', String(tsp.userId));
                    if (tsp.deptId) tp.set('deptId', String(tsp.deptId));
                    const r = await fetch(`${HRMS_API}/tickets?${tp}`, { credentials:'include', headers: authHeaders() });
                    if (r.ok) {
                        const d = await r.json();
                        setTicketCache({ tickets: d.tickets || [], ready: true });
                    }
                } catch(_) {}
            }, [currentUser]);
            React.useEffect(() => {
                if (!currentUser) return;
                refreshTicketCache();
                const t = setInterval(refreshTicketCache, 60000);
                return () => clearInterval(t);
            }, [refreshTicketCache]);
            const ticketCacheValue = React.useMemo(
                () => ({ ...ticketCache, refresh: refreshTicketCache }),
                [ticketCache, refreshTicketCache]
            );

            // handleEmailLogin removed — Microsoft Entra is the only login method


            // /#logout — explicit sign-out destination
            if (currentPage === 'logout') {
                return <LogoutPage />;
            }
            // Auth error (session expired, not authorised, etc.) — show error screen
            if (signedOut && authError) {
                return <SignedOutScreen onSignBackIn={handleSignBackIn} authError={authError} />;
            }
            // Not authenticated (initial load or after sign-out redirect) — show login
            if (!currentUser) {
                return <LoginPage onSignIn={handleSignBackIn} />;
            }

            // Memoize — only recalculates when user role/position changes
            const allowedPages = React.useMemo(() => getAccessiblePages(currentUser), [currentUser]);
            const renderPage = () => {
                // Block direct URL access to pages outside the user's role
                if (!allowedPages.includes(currentPage)) return <Dashboard />;
                switch (currentPage) {
                    case 'dashboard': return <Dashboard />;
                    case 'create-ticket': return <CreateTicket />;
                    case 'tickets': return <TicketsPage />;
                    case 'calendar': return <CalendarPage />;
                    case 'analytics': return <AnalyticsPage />;
                    case 'org-chart': return <OrgChartPage />;
                    case 'staff-performance': return <StaffPerformancePage />;
                    case 'team-comparison': return <TeamComparisonPage />;
                    case 'staff-management': return <StaffManagementPage />;
                    case 'ticket-log': return <TicketLogPage />;
                    case 'vehicle-management': return <VehicleManagementPage />;
                    case 'scheduled-reports': return <ScheduledReportsPage />;
                    case 'email-config':      return <EmailConfigPage />;
                    case 'ex-staff':          return <ExStaffPage />;
                    case 'activity-log':      return <ActivityLogPage />;
                    case 'settings':          return <SettingsPage />;
                    default: return <Dashboard />;
                }
            };

            const appBg = darkMode ? '#0F172A' : '#F9FAFB';

            return (
                <TicketCacheContext.Provider value={ticketCacheValue}>
                <DarkModeContext.Provider value={darkMode}>
                <div style={{display:'flex', height:'100vh', background:appBg, overflow:'hidden', position:'relative'}}>

                    {/* Desktop inline sidebar */}
                    {sidebarOpen && (
                        <Navigation
                            currentPage={currentPage}
                            setCurrentPage={p => { handlePageChange(p); }}
                            onSignOut={handleSignOut}
                            currentUser={currentUser}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Mobile/tablet overlay sidebar */}
                    {mobileOverlay && (
                        <>
                            <div className="yc-backdrop" onClick={closeMobileNav}/>
                            <div className="yc-sidebar-overlay">
                                <Navigation
                                    currentPage={currentPage}
                                    setCurrentPage={p => { handlePageChange(p); closeMobileNav(); }}
                                    onSignOut={() => { handleSignOut(); closeMobileNav(); }}
                                    currentUser={currentUser}
                                    darkMode={darkMode}
                                />
                            </div>
                        </>
                    )}

                    <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:0, overflow:'hidden'}}>
                        <TopBar
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={handleSidebarToggle}
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                            currentUser={currentUser}
                            currentPage={currentPage}
                            onSignOut={handleSignOut}
                            setCurrentPage={handlePageChange}
                        />
                        <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column'}}>
                            {renderPage()}
                        </div>
                    </div>
                </div>
                </DarkModeContext.Provider>
                </TicketCacheContext.Provider>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    
