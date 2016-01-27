import logging
import traceback
from mxcube3 import socketio


@socketio.on('connect', namespace='/logging')
def connect():
    # this is needed to create the namespace, and the actual connection
    # to the server, but we don't need to do anything more
    pass


class MX3LoggingHandler(logging.Handler):
    def __init__(self):
        logging.Handler.__init__(self)

    def _record_to_json(self, record):
        if record.exc_info:
            stack_trace = "".join(traceback.format_exception(*record.exc_info))
        else:
            stack_trace = ""
        try:
            record.asctime
        except AttributeError:
            record.asctime = logging._defaultFormatter.formatTime(record)

        return {"message": record.getMessage(),
                "severity": record.levelname,
                "timestamp": record.asctime,
                "logger": record.name,
                "stack_trace": stack_trace
                }

    def emit(self, record):
        record_dict = self._record_to_json(record)
        socketio.emit('log_record', record_dict, namespace='/logging')
