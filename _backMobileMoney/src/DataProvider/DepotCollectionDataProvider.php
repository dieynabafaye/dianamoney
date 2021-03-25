<?php


namespace App\DataProvider;


use ApiPlatform\Core\DataProvider\ContextAwareCollectionDataProviderInterface;
use ApiPlatform\Core\DataProvider\RestrictedDataProviderInterface;
use App\Entity\Agence;
use App\Entity\Depot;
use App\Entity\UserAgence;
use App\Entity\Utilisateur;
use App\Repository\AgenceRepository;
use App\Repository\CompteRepository;
use App\Repository\DepotRepository;
use App\Repository\UtilisateurRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class DepotCollectionDataProvider implements ContextAwareCollectionDataProviderInterface, RestrictedDataProviderInterface
{

    /**
     * @var TokenStorageInterface
     */
    private TokenStorageInterface $tokenStorage;
    /**
     * @var DepotRepository
     */
    private DepotRepository $depotRepository;
    /**
     * @var CompteRepository
     */
    private CompteRepository $compteRepository;

    public function __construct(DepotRepository $depotRepository, TokenStorageInterface $tokenStorage, CompteRepository $compteRepository)
    {
        $this->depotRepository = $depotRepository;
        $this->compteRepository = $compteRepository;
        $this->tokenStorage = $tokenStorage;
    }

    public function supports(string $resourceClass, string $operationName = null, array $context = []): bool
    {
        return Depot::class === $resourceClass;
    }

    public function getCollection(string $resourceClass, string $operationName = null, array $context = []): JsonResponse
    {

        $data = array();
        $userId = $this->tokenStorage->getToken()->getUser()->getId();
        $role = $this->tokenStorage->getToken()->getUser()->getRoles()[0];
        if($role === "ROLE_AdminSysteme"){
            $depots = $this->depotRepository->findBy([], ['id'=>'DESC']);
        }else{
            $depots = $this->depotRepository->findBy(['utilisateur'=>$userId],['id'=>'DESC']);
        }
        foreach($depots as $key => $depot){
            $data[$key]['date'] = $depot->getCreatedAt()->format('Y-m-d à H:i:s');
            $data[$key]['montant'] = $depot->getMontant();
            $data[$key]['numero'] = $depot->getId();
            $data[$key]['compte'] = $depot->getCompte()->getNumCompte();
            $data[$key]['auteur'] = $depot->getUtilisateur()->getNomComplet();
        }

        return new JsonResponse(['data'=>$data]);
       // gné kanolé
    }


}