sudo ln -s /home/pavelmash/dev/ubjs/apps/autotest/ub_autotest.socket /etc/systemd/system
sudo ln -s /home/pavelmash/dev/ubjs/apps/autotest/ub_autotest.service /etc/systemd/system
systemctl enable ub_autotest.socket
systemctl start ub_autotest.socket

# systemctl stop ub_autotest.socket

# show all logs (tail)
# journalctl -u ub_autotest -f

# reload unit config after edit
# systemctl daemon-reload

# systemctl restart ub_autotest.socket


# stop all UB 
# sudo killall -INT ub

# jourlald

#journalctl --disk-usage
#journalctl --vacuum-files=2
#journalctl --vacuum-size=2Gb


# Log viewer
apt install systemd-journal-remote
systemctl start systemd-journal-gatewayd.service
http://localhost:19531

# export logs
journalctl -u ub_autotest --no-hostname -o short-iso --since today > _j.log
# for LogView
journalctl -u ub_autotest --no-hostname -o short-iso-precise --since today | grep "ub\[.*\]:   . " > _j.log