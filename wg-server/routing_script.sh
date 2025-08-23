  docker exec VPNserver ip route show
  docker exec VPNserver iptables -L -v -n
  docker exec VPNserver iptables -t nat -L -v -n
  docker exec VPNserver iptables -L -t nat
  docker exec VPNserver ip route add 172.16.1.0/24 via 10.0.0.3 dev wg0
  docker exec VPNserver ip route add 10.255.0.0/16 via 10.0.0.3 dev wg0
  docker exec VPNserver iptables -t nat -A POSTROUTING -d 10.0.0.0/24 -j MASQUERADE



