# -=- encoding: utf-8 -=-
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound
from pyramid.response import Response
import os
import hashlib
import logging

log = logging.getLogger(__name__)

class Minify(object):
    def __init__(self, request):
        self.request = request

    @property
    def enabled(self):
        true_vals = ('true', '1', 'on', 'yes')
        conf = self.request.registry.settings.get('minify.enabled', '')
        return conf.lower() in true_vals

    def compiled_url(self):
        """Resolves the 'route_name', assigning a ``hash`` attribute"""
        hash_filename = os.path.join(self.get_cache_dir(),
                                     self.huge_hash + self.ext)

        print hash_filename + '.gz'
        if not os.path.exists(hash_filename + '.gz'):
            self._run_yui_compressor(hash_filename)

        return self.request.route_url(self.route_name,
                                      hash=self.huge_hash + self.ext)

    def get_cache_dir(self):
        """Use Mako's compiled modules directory by default.  Override if you
        want.  Should return a full path or relative to the current directory.
        """
        return self.request.registry.settings['mako.module_directory']

    def _get_full_path(self, hash_file, gzip=False):
        tpl_dir = self.get_cache_dir()
        return os.path.join(tpl_dir, hash_file) + ('.gz' if gzip else '')

    def render_to_response(self, hash_file):
        """Returns a Response ready with gzip'ed settings active, serving
        the gzip'd resource
        """
        if '/' in hash_file:
            raise HTTPBadRequest('Invalid path')
        file_name = self._get_full_path(hash_file, gzip=True)
        if not os.path.exists(file_name):
            raise HTTPNotFound()
        return Response(content_encoding='gzip', content_type=self.content_type,
                        body=open(file_name).read())

    def _run_yui_compressor(self, hash_filename):
        if not os.path.exists(hash_filename):
            yuicomp_path = self.request.registry.settings['yuicompressor.path']
            if os.path.exists(hash_filename):
                os.system('rm "%s"' % hash_filename)
            for file in self.files:
                cmd = 'java -jar "%s" "%s" >> "%s"' % \
                        (yuicomp_path, file, hash_filename)
                log.debug("Minify for %s: %s" % (file, cmd))
                os.system(cmd)
            cmd = 'gzip "%s"' % hash_filename
            log.debug("Minify: %s" % cmd)
            os.system(cmd)

    @property
    def hash_filename(self):
        return os.path.join(tpl_dir, self.huge_hash + '.min.js')

    @property
    def huge_hash(self):
        hashes = []
        for file in self.files:
            if not os.path.exists(file):
                raise HTTPNotFound('Missing file "%s"' % os.path.basename(file))
            hashes.append(str(os.stat(file).st_mtime))
        return hashlib.md5(''.join(hashes)).hexdigest()

    @property
    def files(self):
        here = os.path.dirname(__file__)
        files = [os.path.join(here, 'static', *els) for els in self.file_list]
        return files

    
class JsMinify(Minify):
    file_list = [('js', 'libs', 'zepto.min.js'),
                 ('js', 'core.js'),
                 ('js', 'libs', 'dust-full-0.3.0.js'),
                 ('js', 'libs', 'spin.min.js'),
                 ('js', 'libs', 'native.history.js'),
                 ]
    type = 'js'
    ext = '.min.js'
    content_type = 'text/javascript'
    route_name = 'minify_js'

class CssMinify(Minify):
    file_list = [('css', 'normalize.css'),
                 ('css', 'layout.css'),
                 ('css', '1140.css'),
                 ]
    type = 'css'
    ext = '.min.css'
    content_type = 'text/css'
    route_name = 'minify_css'
